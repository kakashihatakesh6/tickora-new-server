import { Request, Response } from 'express';
import User from '../models/User';
import Movie from '../models/Movie';
import Sport from '../models/Sport';
import Event from '../models/Event';
import Booking, { BookingStatus } from '../models/Booking';
import { AuthRequest } from '../middleware/authMiddleware';
import HeroImage from '../models/HeroImage';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usersCount = await User.count();
        const moviesCount = await Movie.count();
        const sportsCount = await Sport.count();
        const eventsCount = await Event.count();
        const bookingsCount = await Booking.count();

        const revenue = await Booking.sum('totalAmount', {
            where: { status: BookingStatus.CONFIRMED }
        }) || 0;

        res.json({
            users: usersCount,
            movies: moviesCount,
            sports: sportsCount,
            events: eventsCount,
            bookings: bookingsCount,
            revenue: revenue
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.role === 'admin') {
            res.status(403).json({ error: 'Cannot delete admin user' });
            return;
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const getMovies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const movies = await Movie.findAll({ order: [['createdAt', 'DESC']] });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
};

export const createMovie = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create movie' });
    }
};

export const deleteMovie = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await Movie.destroy({ where: { id } });
        if (result) {
            res.json({ message: 'Movie deleted successfully' });
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete movie' });
    }
};

// Similar for Sports and Events if needed, keeping it simple for now to stick to the plan.
// I'll add Sports as well since it was in the plan.

export const getSports = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sports = await Sport.findAll({ order: [['createdAt', 'DESC']] });
        res.json(sports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sports' });
    }
};

export const createSport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sport = await Sport.create(req.body);
        res.status(201).json(sport);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create sport' });
    }
};

export const deleteSport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await Sport.destroy({ where: { id } });
        if (result) {
            res.json({ message: 'Sport deleted successfully' });
        } else {
            res.status(404).json({ error: 'Sport not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete sport' });
    }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const events = await Event.findAll({ order: [['createdAt', 'DESC']] });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await Event.destroy({ where: { id } });
        if (result) {
            res.json({ message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const bookings = await Booking.findAll({
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('getBookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        if (booking.status === BookingStatus.CANCELLED) {
            res.status(400).json({ error: 'Booking is already cancelled' });
            return;
        }

        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

export const getHeroImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const images = await HeroImage.findAll({ order: [['createdAt', 'DESC']] });
        res.json(images);
    } catch (error) {
        console.error('getHeroImages error:', error);
        res.status(500).json({ error: 'Failed to fetch hero images' });
    }
};

export const createHeroImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { imageUrl, title, description, active } = req.body;
        if (!imageUrl) {
            res.status(400).json({ error: 'imageUrl is required' });
            return;
        }
        const image = await HeroImage.create({ imageUrl, title, description, active });
        res.status(201).json(image);
    } catch (error) {
        console.error('createHeroImage error:', error);
        res.status(500).json({ error: 'Failed to create hero image' });
    }
};

export const deleteHeroImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await HeroImage.destroy({ where: { id } });
        if (result) {
            res.json({ message: 'Hero image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Hero image not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete hero image' });
    }
};
