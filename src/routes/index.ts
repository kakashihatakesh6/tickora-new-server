import { Router } from 'express';
import { register, login, registerValidation, loginValidation } from '../controllers/authController';
import { createEvent, getEvents, getEvent } from '../controllers/eventController';
import {
  createBooking,
  verifyPayment,
  getUserBookings,
  createBookingValidation,
  verifyPaymentValidation
} from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ticket Master API is running'
  });
});

// Auth routes
router.post('/auth/register', registerValidation, register);
router.post('/auth/login', loginValidation, login);

// Event routes
router.get('/events', getEvents);
router.get('/events/:id', getEvent);
router.post('/events', createEvent); // Admin only (not enforced in this version)

// Booking routes (authenticated)
router.post('/bookings', authMiddleware, createBookingValidation, createBooking);
router.post('/bookings/verify', authMiddleware, verifyPaymentValidation, verifyPayment);
router.get('/bookings/my', authMiddleware, getUserBookings);

export default router;
