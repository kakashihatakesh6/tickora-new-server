import { Router } from 'express';

const router = Router();
import { register, login, registerValidation, loginValidation } from '../controllers/authController';
import {
  createBooking,
  verifyPayment,
  getUserBookings,
  getBookingById,
  createBookingValidation,
  verifyPaymentValidation,
  lockSeat,
  unlockSeat
} from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
// Event routes
import { getMovies, getMovie, getMovieShows, getMovieShow, getSports, getSport, getEvents, getEvent, searchAll } from '../controllers/eventController';

// Auth routes
router.post('/auth/register', registerValidation, register);
router.post('/auth/login', loginValidation, login);

router.get('/search', searchAll);
router.get('/movies', getMovies);
router.get('/movies/:id', getMovie);
router.get('/movies/:id/shows', getMovieShows);
router.get('/movie-shows/:showId', getMovieShow);

router.get('/sports', getSports);
router.get('/sports/:id', getSport);

router.get('/events', getEvents);
router.get('/events/:id', getEvent);

// Booking routes (authenticated)
router.post('/bookings', authMiddleware, createBookingValidation, createBooking);
router.post('/bookings/lock', authMiddleware, lockSeat);
router.post('/bookings/unlock', authMiddleware, unlockSeat);
router.post('/bookings/verify', authMiddleware, verifyPaymentValidation, verifyPayment);
router.get('/bookings/my', authMiddleware, getUserBookings);
router.get('/bookings/:id', authMiddleware, getBookingById); // Add specific ID route

export default router;
