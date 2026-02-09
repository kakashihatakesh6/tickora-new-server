import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Event from '../models/Event';
import Movie from '../models/Movie';
import MovieShow from '../models/MovieShow';
import Sport from '../models/Sport';
import Booking from '../models/Booking';
import { BookingStatus } from '../models/Booking';

// Helpers to transform data
// Helpers to transform data
const transformMovie = (m: any) => ({ ...m.toJSON(), event_type: 'MOVIE', type: 'MOVIE' });
const transformSport = (s: any) => ({ ...s.toJSON(), event_type: 'SPORT', type: 'SPORT' });
const transformEvent = (e: any) => ({ ...e.toJSON(), event_type: 'EVENT', type: 'EVENT' }); // Concerts

export const getMovies = async (req: Request, res: Response) => {
    try {
        // Return unique movies only (no duplicates)
        const movies = await Movie.findAll();
        res.json(movies.map(transformMovie));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching movies' });
    }
};

export const getMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        
        // Return movie details without show-specific data
        return res.json(transformMovie(movie));
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching movie' });
    }
};

// Get all shows for a specific movie
export const getMovieShows = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Verify movie exists
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        
        // Fetch all shows for this movie
        const shows = await MovieShow.findAll({
            where: { movieId: id },
            order: [['dateTime', 'ASC']]
        });
        
        return res.json(shows);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching movie shows' });
    }
};

// Get a specific movie show by ID
export const getMovieShow = async (req: Request, res: Response) => {
    try {
        const { showId } = req.params;
        const show = await MovieShow.findByPk(showId, {
            include: [{
                model: Movie,
                as: 'movie'
            }]
        });
        
        if (!show) return res.status(404).json({ error: 'Show not found' });
        
        // Fetch occupied seats for this specific show
        const bookings = await Booking.findAll({
            where: {
                eventId: showId,
                bookingType: 'MOVIE',
                status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
            },
            attributes: ['seatNumbers']
        });
        
        const occupiedSeats = new Set<string>();
        bookings.forEach(b => b.seatNumbers.forEach(s => occupiedSeats.add(s)));
        
        const showData = show.toJSON() as any;
        const movieData = showData.movie || {};

        // Flatten the response for easier frontend consumption
        const responseData = {
            ...showData,
            title: movieData.title,
            image_url: movieData.image_url,
            description: movieData.description,
            duration: movieData.duration,
            language: movieData.language,
            rating: movieData.rating,
            event_type: 'MOVIE',
            date_time: show.dateTime, // Frontend expects snake_case sometimes
            occupied_seats: Array.from(occupiedSeats)
        };

        return res.json(responseData);
    } catch (error) {
        console.error('Error fetching movie show:', error);
        return res.status(500).json({ error: 'Error fetching show' });
    }
};

export const getSports = async (req: Request, res: Response) => {
    try {
        const sports = await Sport.findAll();
        res.json(sports.map(transformSport));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sports' });
    }
};

export const getSport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sport = await Sport.findByPk(id);
        if (!sport) return res.status(404).json({ error: 'Sport not found' });

        const bookings = await Booking.findAll({
            where: {
                eventId: id,
                bookingType: 'SPORT',
                status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
            },
            attributes: ['seatNumbers']
        });

        const occupiedSeats = new Set<string>();
        bookings.forEach(b => b.seatNumbers.forEach(s => occupiedSeats.add(s)));

        return res.json({ ...transformSport(sport), occupied_seats: Array.from(occupiedSeats) });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching sport' });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.findAll();
         res.json(events.map(transformEvent));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
};

export const getEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const bookings = await Booking.findAll({
            where: {
                eventId: id,
                bookingType: 'EVENT',
                status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
            },
            attributes: ['seatNumbers']
        });

        const occupiedSeats = new Set<string>();
        bookings.forEach(b => b.seatNumbers.forEach(s => occupiedSeats.add(s)));

        return res.json({ ...transformEvent(event), occupied_seats: Array.from(occupiedSeats) });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching event' });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented for split architecture yet' });
};
