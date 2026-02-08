import request from 'supertest';
import app from '../app';
import { Event } from '../models/index';
import { EventType } from '../models/Event';
import sequelize from '../config/database';

describe('Event Routes', () => {
  beforeEach(async () => {
    await Event.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('GET /api/events', () => {
    it('should return empty list when no events', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return list of events', async () => {
      await Event.create({
        title: 'Test Event',
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

      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('title', 'Test Event');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event details', async () => {
      const event = await Event.create({
        title: 'Test Event',
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

      const res = await request(app).get(`/api/events/${event.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/99999');
      expect(res.status).toBe(404);
    });
  });
});
