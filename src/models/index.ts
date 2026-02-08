import sequelize from '../config/database';
import User from './User';
import Event from './Event';
import Booking from './Booking';
import Ticket from './Ticket';

// Define all associations here after all models are loaded
// This prevents circular dependency issues

// User associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });

// Event associations
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Booking.hasMany(Ticket, { foreignKey: 'bookingId', as: 'tickets' });

// Ticket associations
Ticket.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

export { User, Event, Booking, Ticket, sequelize };

export default {
  User,
  Event,
  Booking,
  Ticket,
  sequelize
};
