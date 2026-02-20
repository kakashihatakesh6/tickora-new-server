import express, { RequestHandler } from 'express';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import {
    getStats,
    getUsers,
    deleteUser,
    getMovies,
    createMovie,
    deleteMovie,
    getSports,
    createSport,
    deleteSport,
    getEvents,
    createEvent,
    deleteEvent,
    getBookings,
    cancelBooking,
    getHeroImages,
    createHeroImage,
    deleteHeroImage
} from '../controllers/adminController';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware, isAdmin);

// Dashboard Stats
router.get('/stats', getStats as RequestHandler);

// User Management
router.get('/users', getUsers as RequestHandler);
router.delete('/users/:id', deleteUser as RequestHandler);

// Movie Management
router.get('/movies', getMovies as RequestHandler);
router.post('/movies', createMovie as RequestHandler);
router.delete('/movies/:id', deleteMovie as RequestHandler);

// Sport Management
router.get('/sports', getSports as RequestHandler);
router.post('/sports', createSport as RequestHandler);
router.delete('/sports/:id', deleteSport as RequestHandler);

// Event Management (Concerts, Plays, etc.)
router.get('/events', getEvents as RequestHandler);
router.post('/events', createEvent as RequestHandler);
router.delete('/events/:id', deleteEvent as RequestHandler);

// Booking Management
router.get('/bookings', getBookings as RequestHandler);
router.put('/bookings/:id/cancel', cancelBooking as RequestHandler);

// Hero Image Management
router.get('/hero-images', getHeroImages as RequestHandler);
router.post('/hero-images', createHeroImage as RequestHandler);
router.delete('/hero-images/:id', deleteHeroImage as RequestHandler);

export default router;
