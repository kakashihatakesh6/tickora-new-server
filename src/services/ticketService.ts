import { v4 as uuidv4 } from 'uuid';
import Ticket from '../models/Ticket';
import Booking from '../models/Booking';

export const generateTicket = async (booking: Booking): Promise<Ticket> => {
  // Generate unique code
  const uniqueCode = `TKT-${uuidv4().substring(0, 8)}`;

  // Create ticket details JSON
  const details = {
    event_title: (booking as any).event?.title || '',
    venue: (booking as any).event?.venue || '',
    date_time: (booking as any).event?.dateTime || '',
    seats: booking.seatCount,
    user_name: (booking as any).user?.name || ''
  };

  const ticket = await Ticket.create({
    bookingId: booking.id,
    uniqueCode,
    details: JSON.stringify(details)
  });

  return ticket;
};
