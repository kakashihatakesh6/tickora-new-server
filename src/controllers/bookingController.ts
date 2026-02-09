import { Op } from 'sequelize';
import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware';
import { Booking, Event, User, BookingStatus } from '../models';
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
    console.log(`[VerifyPayment] Starting verification for Booking: ${booking_id}, Payment: ${razorpay_payment_id}`);

    let ticket;
    let fullBooking;

    await sequelize.transaction(async (t) => {
      // 1. Lock the booking first to prevent concurrent updates
      const booking = await Booking.findByPk(booking_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 2. Check if already confirmed (Idempotency)
      if (booking.status === BookingStatus.CONFIRMED) {
        if (booking.razorpayPaymentId === razorpay_payment_id) {
          // Already processed successfully, we can exit transaction and return success
          return;
        } else {
          // Confirmed but with different payment ID? Potentially suspicious or just a weird edge case
          // For now, treat as error or just return collision
          console.error(`[VerifyPayment] Booking ${booking_id} already confirmed with diff Payment ID: ${booking.razorpayPaymentId} vs ${razorpay_payment_id}`);
          throw new Error('Booking already confirmed with a different Payment ID');
        }
      }

      console.log(`[VerifyPayment] Verifying signature for Booking ${booking_id}`);

      // 3. Verify payment signature (if not confirmed)
      const isValid = verifyPaymentSignature(
        booking.razorpayOrderId,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        console.error(`[VerifyPayment] Invalid Signature for Booking ${booking_id}. Order: ${booking.razorpayOrderId}, PayID: ${razorpay_payment_id}`);
        throw new Error('Invalid payment signature');
      }

      console.log(`[VerifyPayment] Signature valid. Locking event to decrement seats.`);

      // 4. Lock event to decrease seats safely
      const event = await Event.findByPk(booking.eventId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.availableSeats < booking.seatCount) {
         // Should hopefully not happen if we reserved well, but good safety
         // Mark booking as FAILED so we don't retry locally without new logic
         console.error(`[VerifyPayment] Seats not available for Booking ${booking_id}. Required: ${booking.seatCount}, Avail: ${event.availableSeats}`);
         booking.status = BookingStatus.FAILED;
         await booking.save({ transaction: t });
         throw new Error('Seats no longer available. Refund initiated.');
      }

      // 5. Update Event (Decrement seats)
      event.availableSeats -= booking.seatCount;
      await event.save({ transaction: t });

      // 6. Update Booking (Confirm)
      booking.status = BookingStatus.CONFIRMED;
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save({ transaction: t });
      console.log(`[VerifyPayment] Booking ${booking_id} confirmed successfully.`);
    });

    // 7. Fetch full booking for response (outside transaction)
    fullBooking = await Booking.findByPk(booking_id, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' }
      ]
    });

    if (!fullBooking) {
        throw new Error('Could not fetch confirmed booking details');
    }

    // 8. Generate ticket
    try {
      ticket = await generateTicket(fullBooking);
    } catch (ticketError: any) {
      console.error('Ticket generation failed:', ticketError);
      res.status(200).json({
        message: 'Payment verified, but ticket generation failed.',
        booking: fullBooking,
        error: ticketError.message
      });
      return;
    }

    res.status(200).json({
      message: 'Payment verified and booking confirmed',
      booking: fullBooking,
      ticket
    });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    const message = error.message || 'Error verifying payment';
    // If it's a known logic error (like Booking not found), we can be specific, 
    // otherwise 409 Conflict is a reasonable default for state issues.
    res.status(409).json({ error: message });
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
        },
        {
          model: require('../models/Ticket').default, // Lazy load to avoid circular dep if needed, or better use the index export
          as: 'tickets' // Check association alias in index.ts: Booking.hasMany(Ticket, { as: 'tickets' })
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform to snake_case for frontend
    const transformedBookings = bookings
      .filter(booking => booking.event) // Filter out bookings without events
      .map(booking => {
         const ticket = (booking as any).tickets && (booking as any).tickets.length > 0 ? (booking as any).tickets[0] : null;
         return {
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
    });

    res.status(200).json(transformedBookings);
  } catch (error: any) {
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
          model: Event, 
          as: 'event',
          attributes: ['id', 'title', 'venue', 'city', 'dateTime', 'imageURL', 'language', 'format', 'screenNumber'] // Added new fields
        },
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

    const ticket = (booking as any).tickets && (booking as any).tickets.length > 0 ? (booking as any).tickets[0] : null;
    
    // Explicitly cast event to include new fields since Typescript model definition might lag in this context 
    // without full restart/type regeneration, but runtime will work if keys exist in DB
    const eventData = booking.event as any; 

    const transformedBooking = {
        id: booking.id,
        event: {
          id: eventData.id,
          title: eventData.title,
          venue: eventData.venue,
          city: eventData.city,
          date_time: eventData.dateTime,
          image_url: eventData.imageURL,
          language: eventData.language || 'Hindi',
          format: eventData.format || '2D',
          screen_number: eventData.screenNumber || 'AUDI 2',
          ticket_level: 'CLASSIC' // Hardcoded for now or fetch if added to model
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
