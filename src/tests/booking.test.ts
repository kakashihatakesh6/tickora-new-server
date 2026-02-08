import request from 'supertest';
import app from '../app';
import { User, Event, Booking } from '../models/index';
import { EventType } from '../models/Event';
import jwt from 'jsonwebtoken';

describe('Booking Routes', () => {
  let token: string;
  let user: User;
  let event: Event;

  beforeEach(async () => {
    await Booking.destroy({ where: {}, truncate: true, cascade: true });
    await Event.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Create user and get token
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123' 
    });

    token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET || 'changeme_in_production', { expiresIn: '1h' });

    // Create event
    event = await Event.create({
      title: 'Booking Event',
      description: 'Test Description',
      eventType: EventType.MOVIE,
      city: 'Test City',
      venue: 'Test Venue',
      dateTime: new Date(),
      price: 100,
      totalSeats: 100,
      availableSeats: 100,
      imageURL: 'http://example.com/image.jpg'
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          event_id: event.id,
          seat_count: 2
        });

      // Status might be 201 or 200 depending on implementation
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('booking');
      expect(res.body.booking).toHaveProperty('id');
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          event_id: event.id,
          seat_count: 2
        });

      expect(res.status).toBe(401);
    });
  });
});
