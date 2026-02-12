import { Op } from 'sequelize';
import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware';
import { Booking, Event, User, BookingStatus } from '../models';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/razorpayService';
import { generateTicket } from '../services/ticketService';
import sequelize from '../config/database';

import { acquireLock, releaseLock, checkLock, extendLock } from '../services/lockService';
// ... imports

export const createBookingValidation = [
  body('event_id').isInt({ min: 1 }).withMessage('Valid event_id is required'),
  body('seat_numbers').isArray({ min: 1 }).withMessage('seat_numbers must be a non-empty array of strings'),
  body('seat_numbers.*').isString().withMessage('Each seat number must be a string')
];

export const verifyPaymentValidation = [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking_id is required'),
  body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
  body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required')
];

// ...

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array()[0].msg });
      return;
    }

    const userId = req.userId!;
    const { event_id, seat_numbers, bookingType, price: providedPrice } = req.body;
    const seat_count = seat_numbers.length;

    // Validate event exists based on bookingType
    let eventExists = false;
    let price = 0;
    let eventModel: any = null;

    // For MOVIE bookings, event_id is actually the showId (MovieShow ID)
    if (bookingType === 'MOVIE') {
      eventModel = require('../models/MovieShow').default;
    } else if (bookingType === 'SPORT') {
      eventModel = require('../models/Sport').default;
    } else { // Default to 'EVENT'
      eventModel = require('../models/Event').default;
    }

    const eventCheck = await eventModel.findByPk(event_id);
    if (eventCheck) {
      eventExists = true;
      // Logic: Use providedPrice if bookingType is SPORT, otherwise fallback to event default price
      price = (bookingType === 'SPORT' && providedPrice) ? Number(providedPrice) : eventCheck.price;
    }

    if (!eventExists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    let booking: Booking | null = null;
    let orderId: string = '';

    // Transaction to lock seats
    await sequelize.transaction(async (t) => {
      // Lock the event row for update using the determined model
      const event = await eventModel.findByPk(event_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.availableSeats < seat_count) {
        throw new Error('not enough seats available');
      }

      // Check if seats are taken (simplified check for now due to complex cross-table logic)
      // Ideally we check Booking table for same eventId AND bookingType
      const existingBookings = await Booking.findAll({
        where: {
          eventId: event_id,
          bookingType: bookingType || 'EVENT', // Important: Filter by type too
          status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
        },
        transaction: t,
        lock: t.LOCK.SHARE
      });

      const occupiedSeats = new Set<string>();
      existingBookings.forEach(b => {
        if (Array.isArray(b.seatNumbers)) {
          b.seatNumbers.forEach(s => occupiedSeats.add(s));
        }
      });

      for (const seat of seat_numbers) {
        if (occupiedSeats.has(seat)) {
          throw new Error(`Seat ${seat} is already booked.`);
        }

        // Check if the current user holds the lock for this seat
        const lockKey = `lock:seat:${event_id}:${seat}`;
        const lockValue = await checkLock(lockKey);

        if (!lockValue) {
          // Try to acquire lock now in case it expired or wasn't set (e.g. direct API call)
          // We set a short TTL or standard TTL.
          const acquired = await acquireLock(lockKey, userId.toString(), 300);
          if (!acquired) {
            throw new Error(`Seat ${seat} is unavailable (locked by another user/system).`);
          }
        } else if (lockValue !== userId.toString()) {
          throw new Error(`Seat ${seat} is currently locked by another user.`);
        }
      }

      const totalAmount = seat_count * price;

      // Create Razorpay Order
      orderId = await createRazorpayOrder(totalAmount, userId.toString());

      booking = await Booking.create(
        {
          userId,
          eventId: event_id,
          bookingType: bookingType || 'EVENT',
          seatCount: seat_count,
          seatNumbers: seat_numbers,
          totalAmount,
          status: BookingStatus.PENDING,
          razorpayOrderId: orderId,
          razorpayPaymentId: ''
        },
        { transaction: t }
      );
    });

    res.status(201).json({ booking, order_id: orderId });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(409).json({ error: error.message || 'Error creating booking' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array()[0].msg });
      return;
    }

    const { booking_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log(`[VerifyPayment] Starting verification for Booking: ${booking_id}, Payment: ${razorpay_payment_id}`);

    let ticket;
    let fullBooking;

    await sequelize.transaction(async (t) => {
      // 1. Lock the booking first
      const booking = await Booking.findByPk(booking_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 2. Check Idempotency
      if (booking.status === BookingStatus.CONFIRMED) {
        if (booking.razorpayPaymentId === razorpay_payment_id) {
          return;
        } else {
          throw new Error('Booking already confirmed with a different Payment ID');
        }
      }

      // 3. Verify signature
      const isValid = verifyPaymentSignature(
        booking.razorpayOrderId,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // 4. Determine Event Model
      let EventModel: any;
      if (booking.bookingType === 'MOVIE') EventModel = require('../models/MovieShow').default;
      else if (booking.bookingType === 'SPORT') EventModel = require('../models/Sport').default;
      else EventModel = require('../models/Event').default;

      // 5. Lock event
      const event = await EventModel.findByPk(booking.eventId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.availableSeats < booking.seatCount) {
        booking.status = BookingStatus.FAILED;
        await booking.save({ transaction: t });
        throw new Error('Seats no longer available. Refund initiated.');
      }

      // 6. Update Event
      event.availableSeats -= booking.seatCount;
      await event.save({ transaction: t });

      // 7. Update Booking
      booking.status = BookingStatus.CONFIRMED;
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save({ transaction: t });
    });

    // 8. Fetch details for response (outside transaction)
    fullBooking = await Booking.findByPk(booking_id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!fullBooking) throw new Error('Could not fetch confirmed booking details');

    // Manually fetch event details for ticket generation if needed, 
    // but generateTicket service might need update too if it relies on fullBooking.event
    // For now, let's assume generateTicket handles it or we pass event data?
    // Actually generateTicket probably expects booking.event.
    // Let's attach it.

    let EventModel: any;
    if (fullBooking.bookingType === 'MOVIE') EventModel = require('../models/MovieShow').default;
    else if (fullBooking.bookingType === 'SPORT') EventModel = require('../models/Sport').default;
    else EventModel = require('../models/Event').default;

    const eventDetails = await EventModel.findByPk(fullBooking.eventId);
    (fullBooking as any).event = eventDetails; // Manually attach

    try {
      ticket = await generateTicket(fullBooking);
    } catch (ticketError: any) {
      console.error('Ticket generation failed:', ticketError);
      // Proceed even if ticket fails, strictly speaking payment is done
    }

    res.status(200).json({
      message: 'Payment verified and booking confirmed',
      booking: fullBooking,
      ticket
    });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    res.status(409).json({ error: error.message || 'Error verifying payment' });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: require('../models/Ticket').default,
          as: 'tickets'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const transformedBookings = [];

    for (const booking of bookings) {
      let eventDetails: any = null;
      let Model: any = null;

      if (booking.bookingType === 'MOVIE') Model = require('../models/MovieShow').default;
      else if (booking.bookingType === 'SPORT') Model = require('../models/Sport').default;
      else Model = require('../models/Event').default;

      eventDetails = await Model.findByPk(booking.eventId);

      if (eventDetails) {
        const ticket = (booking as any).tickets && (booking as any).tickets.length > 0 ? (booking as any).tickets[0] : null;
        transformedBookings.push({
          id: booking.id,
          event: {
            id: eventDetails.id,
            title: eventDetails.title,
            venue: eventDetails.venue,
            city: eventDetails.city,
            date_time: eventDetails.dateTime,
            image_url: eventDetails.imageURL
          },
          seat_count: booking.seatCount,
          seat_numbers: booking.seatNumbers,
          total_amount: booking.totalAmount,
          status: booking.status,
          created_at: booking.createdAt,
          ticket: ticket ? {
            id: ticket.id,
            unique_code: ticket.uniqueCode,
            details: ticket.details
          } : null
        });
      }
    }

    res.status(200).json(transformedBookings);
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message || 'Error fetching bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = req.params.id;
    console.log(`[getBookingById] Request for Booking ID: ${bookingId} by User ID: ${userId}`);

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [
        {
          model: require('../models/Ticket').default,
          as: 'tickets'
        }
      ]
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    let EventModel: any;
    if (booking.bookingType === 'MOVIE') EventModel = require('../models/MovieShow').default;
    else if (booking.bookingType === 'SPORT') EventModel = require('../models/Sport').default;
    else EventModel = require('../models/Event').default;

    const eventDetails = await EventModel.findByPk(booking.eventId);

    if (!eventDetails) {
      res.status(404).json({ error: 'Associated event not found' });
      return;
    }

    const ticket = (booking as any).tickets && (booking as any).tickets.length > 0 ? (booking as any).tickets[0] : null;

    // Helper to get consistent fields
    const getField = (f: string) => (eventDetails as any)[f];

    const transformedBooking = {
      id: booking.id,
      event: {
        id: eventDetails.id,
        title: eventDetails.title,
        venue: eventDetails.venue,
        city: eventDetails.city,
        date_time: eventDetails.dateTime,
        image_url: eventDetails.imageURL,
        language: getField('language'),
        format: getField('format'),
        screen_number: getField('screenNumber'),
        ticket_level: 'STANDARD'
      },
      seat_count: booking.seatCount,
      seat_numbers: booking.seatNumbers,
      total_amount: booking.totalAmount,
      status: booking.status,
      created_at: booking.createdAt,
      ticket: ticket ? {
        id: ticket.id,
        unique_code: ticket.uniqueCode,
        details: ticket.details
      } : null
    };

    res.status(200).json(transformedBooking);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching booking' });
  }
};

export const lockSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { eventId, seatId, bookingType } = req.body;

    if (!eventId || !seatId) {
      res.status(400).json({ error: 'eventId and seatId are required' });
      return;
    }

    const lockKey = `lock:seat:${eventId}:${seatId}`;
    const lockedBy = await checkLock(lockKey);

    if (lockedBy && lockedBy !== userId.toString()) {
      res.status(409).json({ error: 'Seat is currently locked by another user', lockedBy: 'other' });
      return;
    }

    if (lockedBy === userId.toString()) {
      // Extend lock
      await extendLock(lockKey, userId.toString());
      res.status(200).json({ message: 'Lock extended', status: 'locked' });
      return;
    }

    // Try to acquire lock
    const acquired = await acquireLock(lockKey, userId.toString());

    if (acquired) {
      res.status(200).json({ message: 'Seat locked successfully', status: 'locked' });
    } else {
      res.status(409).json({ error: 'Could not acquire lock', lockedBy: 'unknown' });
    }

  } catch (error: any) {
    console.error('Lock Seat Error:', error);
    res.status(500).json({ error: error.message || 'Error locking seat' });
  }
};

export const unlockSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { eventId, seatId } = req.body;

    const lockKey = `lock:seat:${eventId}:${seatId}`;
    const released = await releaseLock(lockKey, userId.toString());

    if (released) {
      res.status(200).json({ message: 'Seat unlocked successfully' });
    } else {
      res.status(400).json({ error: 'Could not unlock seat (maybe not locked by you)' });
    }
  } catch (error: any) {
    console.error('Unlock Seat Error:', error);
    res.status(500).json({ error: error.message || 'Error unlocking seat' });
  }
};
