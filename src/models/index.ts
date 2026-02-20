// Export all models from a central location
import User from './User';
import Event, { EventType } from './Event';
import Movie from './Movie';
import MovieShow from './MovieShow';
import Sport from './Sport';
import Booking, { BookingStatus } from './Booking';
import Ticket from './Ticket';
import HeroImage from './HeroImage';

// Define Associations
Movie.hasMany(MovieShow, { foreignKey: 'movieId', as: 'shows' });
MovieShow.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Booking.hasMany(Ticket, { foreignKey: 'bookingId', as: 'tickets' });
Ticket.belongsTo(Booking, { foreignKey: 'bookingId', as: 'ticket' });

export {
    User,
    Event,
    EventType,
    Movie,
    MovieShow,
    Sport,
    Booking,
    BookingStatus,
    Ticket,
    HeroImage
};

