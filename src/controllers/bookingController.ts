import { Op } from 'sequelize';
import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware';
import Booking from '../models/Booking';
import Event from '../models/Event';
import User from '../models/User';
import { BookingStatus } from '../models/Booking';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/razorpayService';
import { generateTicket } from '../services/ticketService';
import sequelize from '../config/database';

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
    const { event_id, seat_numbers } = req.body;
    const seat_count = seat_numbers.length;

    let booking: Booking | null = null;
    let orderId: string = '';

    // Transaction to lock seats
    await sequelize.transaction(async (t) => {
      // Lock the event row for update
      const event = await Event.findByPk(event_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.availableSeats < seat_count) {
        throw new Error('not enough seats available');
      }

      // Check if specific seats are already taken
      // 1. Get all bookings for this event that are confirmed or pending
      const existingBookings = await Booking.findAll({
        where: {
          eventId: event_id,
          status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
        },
        transaction: t,
        lock: t.LOCK.SHARE // Share lock is unnecessary if we trust the logic, but safe
      });

      // 2. Flatten all occupied seat numbers
      const occupiedSeats = new Set<string>();
      existingBookings.forEach(b => {
        if (Array.isArray(b.seatNumbers)) {
          b.seatNumbers.forEach(s => occupiedSeats.add(s));
        }
      });

      // 3. Check for overlap
      for (const seat of seat_numbers) {
        if (occupiedSeats.has(seat)) {
          throw new Error(`Seat ${seat} is already booked or reserved.`);
        }
      }

      const totalAmount = seat_count * event.price;

      // Create Razorpay Order
      orderId = await createRazorpayOrder(totalAmount, userId.toString());

      booking = await Booking.create(
        {
          userId,
          eventId: event_id,
          seatCount: seat_count,
          seatNumbers: seat_numbers, // Store the specific seats
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

    let booking = await Booking.findByPk(booking_id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      res.status(400).json({ error: 'Booking already confirmed' });
      return;
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      booking.razorpayOrderId,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    // Confirm booking and update seats
    await sequelize.transaction(async (t) => {
      booking!.status = BookingStatus.CONFIRMED;
      booking!.razorpayPaymentId = razorpay_payment_id;

      await booking!.save({ transaction: t });

      // Lock event and decrement available seats
      const event = await Event.findByPk(booking!.eventId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.availableSeats < booking!.seatCount) {
        throw new Error('seats no longer available! Refund initiated.');
      }

      event.availableSeats -= booking!.seatCount;
      await event.save({ transaction: t });
    });

    // Fetch full booking with associations
    const fullBooking = await Booking.findByPk(booking_id, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' }
      ]
    });

    if (!fullBooking) {
      res.status(200).json({
        message: 'Payment verified but could not fetch booking details',
        booking
      });
      return;
    }

    // Generate ticket
    let ticket;
    try {
      ticket = await generateTicket(fullBooking);
    } catch (error: any) {
      res.status(200).json({
        message: 'Payment verified, but ticket generation failed.',
        booking: fullBooking,
        error: error.message
      });
      return;
    }

    res.status(200).json({
      message: 'Payment verified and booking confirmed',
      booking: fullBooking,
      ticket
    });
  } catch (error: any) {
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
          model: Event, 
          as: 'event',
          attributes: ['id', 'title', 'venue', 'city', 'dateTime', 'imageURL']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform to snake_case for frontend
    const transformedBookings = bookings
      .filter(booking => booking.event) // Filter out bookings without events
      .map(booking => ({
        id: booking.id,
        event: {
          id: booking.event!.id,
          title: booking.event!.title,
          venue: booking.event!.venue,
          city: booking.event!.city,
          date_time: booking.event!.dateTime,
          image_url: booking.event!.imageURL
        },
        seat_count: booking.seatCount,
        seat_numbers: booking.seatNumbers, // Add seat numbers
        total_amount: booking.totalAmount,
        status: booking.status,
        created_at: booking.createdAt
      }));

    res.status(200).json(transformedBookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching bookings' });
  }
};
