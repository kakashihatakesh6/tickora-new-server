import { Request, Response } from 'express';
import { Op } from 'sequelize'; // Import Op
import Event from '../models/Event';
import Booking from '../models/Booking';
import { BookingStatus } from '../models/Booking';

// Transform Sequelize camelCase to API snake_case
const transformEventToAPI = (event: any, occupiedSeats: string[] = []) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  event_type: event.eventType,
  city: event.city,
  venue: event.venue,
  date_time: event.dateTime,
  price: event.price,
  total_seats: event.totalSeats,
  available_seats: event.availableSeats,
  image_url: event.imageURL,
  occupied_seats: occupiedSeats, // Add occupied seats
  created_at: event.createdAt,
  updated_at: event.updatedAt
});
// ... createEvent and getEvents (unchanged implementation details, minimal diff) ...
export const createEvent = async (req: Request, res: Response): Promise<void> => {
   // ... (same as before) ...
   try {
    const eventData = req.body;
    // Set availableSeats to totalSeats
    eventData.availableSeats = eventData.totalSeats;
    const event = await Event.create(eventData);
    res.status(201).json(transformEventToAPI(event));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating event' });
  }
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
 // ... (same as before)
 try {
    const { category, city } = req.query;
    const whereClause: any = {};
    if (category) whereClause.eventType = category;
    if (city) whereClause.city = city;
    const events = await Event.findAll({ where: whereClause });
    // Note: optimization - we aren't fetching occupied seats for the list view
    res.status(200).json(events.map(e => transformEventToAPI(e)));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Fetch occupied seats
    const bookings = await Booking.findAll({
      where: {
        eventId: id,
        status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
      },
      attributes: ['seatNumbers']
    });

    const occupiedSeats = new Set<string>();
    bookings.forEach(b => {
      if (Array.isArray(b.seatNumbers)) {
        b.seatNumbers.forEach(s => occupiedSeats.add(s));
      }
    });

    res.status(200).json(transformEventToAPI(event, Array.from(occupiedSeats)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching event' });
  }
};
