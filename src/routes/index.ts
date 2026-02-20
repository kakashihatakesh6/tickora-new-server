import { Router, RequestHandler } from 'express';

const router = Router();
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation
} from '../controllers/authController';
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
router.post('/auth/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/auth/verify-otp', verifyOtpValidation, verifyOtp);
router.post('/auth/reset-password', resetPasswordValidation, resetPassword);

import { getMe } from '../controllers/authController';
router.get('/auth/me', authMiddleware, getMe as RequestHandler);

// OAuth routes
import passport from 'passport';
import { oauthCallback } from '../controllers/authController';

// Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  oauthCallback as RequestHandler
);

// GitHub
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  oauthCallback as RequestHandler
);

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
router.post('/bookings', authMiddleware, createBookingValidation, createBooking as RequestHandler);
router.post('/bookings/lock', authMiddleware, lockSeat as RequestHandler);
router.post('/bookings/unlock', authMiddleware, unlockSeat as RequestHandler);
router.post('/bookings/verify', authMiddleware, verifyPaymentValidation, verifyPayment as RequestHandler);
router.get('/bookings/my', authMiddleware, getUserBookings as RequestHandler);
router.get('/bookings/:id', authMiddleware, getBookingById as RequestHandler); // Add specific ID route

export default router;
