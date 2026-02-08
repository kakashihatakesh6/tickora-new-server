import dotenv from 'dotenv';
import sequelize, { connectDatabase } from './config/database';
import Event from './models/Event';
import { EventType } from './models/Event';
import User from './models/User';
import Booking from './models/Booking';
import Ticket from './models/Ticket';

// Load environment variables
dotenv.config();

const seedEvents = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Sync models (force: true drops tables and recreates them)
    await sequelize.sync({ force: true });

    const events = [
      {
        title: 'Inception',
        eventType: EventType.MOVIE,
        city: 'Mumbai',
        venue: 'PVR Icon, Phoenix',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
        price: 350,
        totalSeats: 100,
        availableSeats: 100,
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        imageURL: 'https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        duration: '2h 28m',
        language: 'English, Hindi',
        rating: 4.8,
        cast: [
          { name: 'Leonardo DiCaprio', role: 'Dom Cobb', image: 'https://image.tmdb.org/t/p/w200/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
          { name: 'Joseph Gordon-Levitt', role: 'Arthur', image: 'https://image.tmdb.org/t/p/w200/42e8Q2u7nQESk0SVatq8sXJ9E6.jpg' },
          { name: 'Elliot Page', role: 'Ariadne', image: 'https://image.tmdb.org/t/p/w200/eXj5p9lFqF0z3y4x8qj1v6l0d5.jpg' }
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director', image: 'https://image.tmdb.org/t/p/w200/xuDCxdv7q8r9wF8yJ2r9q5.jpg' },
          { name: 'Hans Zimmer', role: 'Music Composer', image: 'https://image.tmdb.org/t/p/w200/tpQnDeHY15szIXvpnhlpRrD8.jpg' }
        ]
      },
      {
        title: 'Interstellar',
        eventType: EventType.MOVIE,
        city: 'Delhi',
        venue: 'IMAX Select',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        price: 500,
        totalSeats: 150,
        availableSeats: 150,
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        imageURL: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
        duration: '2h 49m',
        language: 'English',
        rating: 4.9,
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', image: 'https://image.tmdb.org/t/p/w200/wJmTpWcLemR4E819.jpg' },
          { name: 'Anne Hathaway', role: 'Brand', image: 'https://image.tmdb.org/t/p/w200/42e8Q2u7nQESk0SVatq8sXJ9E6.jpg' }
        ],
        crew: [
            { name: 'Christopher Nolan', role: 'Director', image: 'https://image.tmdb.org/t/p/w200/xuDCxdv7q8r9wF8yJ2r9q5.jpg' }
        ]
      },
      {
        title: 'IPL Final: CSK vs MI',
        eventType: EventType.SPORT,
        city: 'Chennai',
        venue: 'Chepauk Stadium',
        dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month later
        price: 2500,
        totalSeats: 30000,
        availableSeats: 30000,
        description: 'The ultimate showdown between the two giants of Indian cricket.',
        imageURL: 'https://wallpaperaccess.com/full/1887342.jpg',
        duration: '4h',
        language: 'English, Hindi, Tamil',
        rating: 4.7,
        cast: [],
        crew: []
      },
      {
        title: 'Premier League: Arsenal vs Liverpool',
        eventType: EventType.SPORT,
        city: 'London',
        venue: 'Emirates Stadium',
        dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days later
        price: 8000,
        totalSeats: 50,
        availableSeats: 50,
        description: 'English Premier League classic match.',
        imageURL: 'https://e0.365dm.com/23/04/1600x900/skysports-arsenal-liverpool-premier-league_6115886.jpg',
        duration: '2h',
        language: 'English',
        rating: 4.6,
        cast: [],
        crew: []
      },
      {
        title: 'Coldplay World Tour',
        eventType: EventType.CONCERT,
        city: 'Mumbai',
        venue: 'DY Patil Stadium',
        dateTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months later
        price: 5000,
        totalSeats: 45000,
        availableSeats: 45000,
        description: 'Experience the magic of Coldplay live in concert.',
        imageURL: 'https://media.pitchfork.com/photos/66dc643d2fc3b8a3424d547f/master/pass/Coldplay.jpg',
        duration: '3h',
        language: 'English',
        rating: 4.9,
        cast: [
           { name: 'Chris Martin', role: 'Vocals', image: 'https://image.tmdb.org/t/p/w200/t.jpg' }
        ],
        crew: []
      },
      {
        title: 'Arijit Singh Live',
        eventType: EventType.CONCERT,
        city: 'Bangalore',
        venue: 'Palace Grounds',
        dateTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days later
        price: 1500,
        totalSeats: 5000,
        availableSeats: 5000,
        description: 'Soulful melodies by the one and only Arijit Singh.',
        imageURL: 'https://in.bmscdn.com/events/moviecard/ET00342407.jpg',
        duration: '3h',
        language: 'Hindi',
        rating: 4.8,
        cast: [
            { name: 'Arijit Singh', role: 'Singer', image: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/arijit-singh-1048083-24-03-2017-18-02-14.jpg' }
        ],
        crew: []
      }
    ];

    for (const eventData of events) {
      // Check if event already exists to avoid duplicates
      const existingEvent = await Event.findOne({ where: { title: eventData.title } });

      if (!existingEvent) {
        await Event.create(eventData);
        console.log(`✅ Seeded event: ${eventData.title}`);
      } else {
        console.log(`⏭️  Skipping existing event: ${eventData.title}`);
      }
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedEvents();
