import dotenv from 'dotenv';
import sequelize, { connectDatabase } from './config/database';
import Event from './models/Event';
import Movie from './models/Movie';
import MovieShow from './models/MovieShow';
import Sport from './models/Sport';
import { EventType } from './models/Event';
import User from './models/User';
import Booking from './models/Booking';
import Ticket from './models/Ticket';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const seedEvents = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Sync models (force: true drops tables and recreates them)
    await sequelize.sync({ force: true });

    console.log('🗄️  Database synced successfully\n');

    // ========== CREATE ADMIN USER ==========
    const hashedPassword = await bcrypt.hash('admin', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ticketmaster.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log(`👤 Created Admin User: ${adminUser.email}`);

    // ========== MOVIES ==========
    const moviesData = [
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        image_url: 'https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
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
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        image_url: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
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
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        image_url: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        duration: '2h 32m',
        language: 'English, Hindi',
        rating: 4.9,
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne', image: 'https://image.tmdb.org/t/p/w200/3qx2QFUbG6t6IlzR0F9k3Z6Yhf7.jpg' },
          { name: 'Heath Ledger', role: 'Joker', image: 'https://image.tmdb.org/t/p/w200/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg' }
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director', image: 'https://image.tmdb.org/t/p/w200/xuDCxdv7q8r9wF8yJ2r9q5.jpg' }
        ]
      }
    ];

    // Create unique movies
    const createdMovies = [];
    for (const movieData of moviesData) {
      const movie = await Movie.create(movieData);
      createdMovies.push(movie);
      console.log(`✅ Created movie: ${movie.title}`);
    }

    // ========== MOVIE SHOWS ==========
    const movieVenues = [
      { name: 'PVR Icon, Phoenix', city: 'Mumbai' },
      { name: 'IMAX Select, CityWalk', city: 'Delhi' },
      { name: 'PVR Director\'s Cut, Ambience Mall', city: 'Delhi' },
      { name: 'Cinepolis, Nexus Mall', city: 'Bangalore' },
      { name: 'PVR Forum Mall', city: 'Hyderabad' },
      { name: 'Inox, R-City', city: 'Mumbai' },
      { name: 'Satyam Cineplex', city: 'Jaipur' },
      { name: 'INOX, Elante Mall', city: 'Chandigarh' },
      { name: 'PVR, Lulu Mall', city: 'Lucknow' }
    ];

    const formats = ['2D', '3D', 'IMAX'];
    const screens = ['AUDI 1', 'AUDI 2', 'AUDI 3', 'SCREEN 1', 'SCREEN 2'];

    // Create multiple shows for each movie
    for (const movie of createdMovies) {
      for (const venue of movieVenues) {
        // Create 2-3 shows per venue
        const showCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < showCount; i++) {
          const daysOffset = Math.floor(Math.random() * 7); // Next 7 days
          const hour = 10 + (i * 3); // 10 AM, 1 PM, 4 PM, 7 PM
          const showDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
          showDate.setHours(hour, 0, 0, 0);

          const format = formats[Math.floor(Math.random() * formats.length)];
          const price = format === 'IMAX' ? 600 : format === '3D' ? 450 : 350;
          const totalSeats = 100;

          await MovieShow.create({
            movieId: movie.id,
            venue: venue.name,
            city: venue.city,
            screenNumber: screens[Math.floor(Math.random() * screens.length)],
            dateTime: showDate,
            price: price,
            totalSeats: totalSeats,
            availableSeats: totalSeats - Math.floor(Math.random() * 20),
            format: format
          });
        }
      }
      console.log(`  ➡️  Created shows for ${movie.title} across ${movieVenues.length} locations`);
    }

    // ========== SPORTS ==========
    const sportsData = [
      {
        title: 'ENGLAND vs WEST INDIES - ICC MEN\'S T20 WC 2026',
        category: 'Cricket',
        city: 'Mumbai',
        venue: 'Wankhede Stadium',
        dateTime: new Date('2026-06-11T19:00:00'),
        price: 5000,
        totalSeats: 30000,
        availableSeats: 30000,
        description: 'England meet West Indies in a highly anticipated evening showdown promising back-and-forth action, explosive batting, and impactful bowling.',
        image_url: 'https://wallpaperaccess.com/full/1887342.jpg',
        duration: '3 hours',
        rating: 4.9,
        team1: 'ENGLAND',
        team2: 'WEST INDIES',
        interested_count: 8300
      },
      {
        title: 'INDIA vs AUSTRALIA - T20 SERIES',
        category: 'Cricket',
        city: 'Delhi',
        venue: 'Arun Jaitley Stadium',
        dateTime: new Date('2026-07-15T19:00:00'),
        price: 3000,
        totalSeats: 40000,
        availableSeats: 35000,
        description: 'The arch-rivals India and Australia face off in a thrilling T20 match in the capital city.',
        image_url: 'https://wallpaperaccess.com/full/1887342.jpg',
        duration: '3.5 hours',
        rating: 5.0,
        team1: 'INDIA',
        team2: 'AUSTRALIA',
        interested_count: 50000
      },
      {
        title: 'IPL Final: CSK vs MI',
        category: 'Cricket',
        city: 'Chennai',
        venue: 'Chepauk Stadium',
        dateTime: new Date('2026-05-30T20:00:00'),
        price: 2500,
        totalSeats: 30000,
        availableSeats: 30000,
        description: 'The ultimate showdown between the two giants of Indian cricket.',
        image_url: 'https://wallpaperaccess.com/full/1887342.jpg',
        duration: '4h',
        rating: 4.7,
        team1: 'CSK',
        team2: 'MI',
        interested_count: 15200
      },
      {
        title: 'ISL: Mumbai City FC vs Mohun Bagan',
        category: 'Football',
        city: 'Mumbai',
        venue: 'Mumbai Football Arena',
        dateTime: new Date('2026-03-05T19:30:00'),
        price: 500,
        totalSeats: 8000,
        availableSeats: 7500,
        description: 'ISL intense match-up in the heart of Mumbai.',
        image_url: 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-64300,resizemode-1,msid-81504505/news/sports/mumbai-city-fc-beat-atk-mohun-bagan-2-1-to-clinch-isl-winners-shield.jpg',
        duration: '2h',
        rating: 4.5,
        team1: 'Mumbai City FC',
        team2: 'Mohun Bagan',
        interested_count: 3400
      },
      {
        title: 'Bengaluru FC vs FC Goa',
        category: 'Football',
        city: 'Bangalore',
        venue: 'Kanteerava Stadium',
        dateTime: new Date('2026-03-10T19:30:00'),
        price: 400,
        totalSeats: 25000,
        availableSeats: 20000,
        description: 'Southern rivalry takes flight at the Fortress.',
        image_url: 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-64300,resizemode-1,msid-81504505/news/sports/mumbai-city-fc-beat-atk-mohun-bagan-2-1-to-clinch-isl-winners-shield.jpg',
        duration: '2h',
        rating: 4.4,
        team1: 'Bengaluru FC',
        team2: 'FC Goa',
        interested_count: 12000
      }
    ];

    for (const sportData of sportsData) {
      await Sport.create(sportData);
      console.log(`✅ Created sport: ${sportData.title} in ${sportData.city}`);
    }

    // ========== EVENTS ==========
    const eventsData = [
      {
        title: 'Coldplay World Tour',
        eventType: EventType.CONCERT,
        city: 'Mumbai',
        venue: 'DY Patil Stadium',
        dateTime: new Date('2026-01-18T18:00:00'),
        price: 5000,
        totalSeats: 45000,
        availableSeats: 45000,
        description: 'Experience the magic of Coldplay live in concert.',
        image_url: 'https://media.pitchfork.com/photos/66dc643d2fc3b8a3424d547f/master/pass/Coldplay.jpg',
        duration: '3h',
        language: 'English',
        rating: 4.9
      },
      {
        title: 'Arijit Singh Live',
        eventType: EventType.CONCERT,
        city: 'Bangalore',
        venue: 'Palace Grounds',
        dateTime: new Date('2026-02-20T19:00:00'),
        price: 1500,
        totalSeats: 5000,
        availableSeats: 5000,
        description: 'Soulful melodies by the one and only Arijit Singh.',
        image_url: 'https://in.bmscdn.com/events/moviecard/ET00342407.jpg',
        duration: '3h',
        language: 'Hindi',
        rating: 4.8
      },
      {
        title: 'Zakir Khan Live - Tathastu',
        eventType: EventType.PLAY,
        city: 'Delhi',
        venue: 'Talkatora Stadium',
        dateTime: new Date('2026-04-10T20:00:00'),
        price: 1000,
        totalSeats: 3000,
        availableSeats: 2000,
        description: 'The Sakht Launda himself, Zakir Khan, performing live.',
        image_url: 'https://in.bmscdn.com/events/moviecard/ET00342407.jpg',
        duration: '2h',
        language: 'Hindi',
        rating: 4.9
      },
      {
        title: 'Sunburn Festival 2026',
        eventType: EventType.CONCERT,
        city: 'Ahmedabad',
        venue: 'Gift City Ground',
        dateTime: new Date('2026-12-28T16:00:00'),
        price: 2500,
        totalSeats: 20000,
        availableSeats: 15000,
        description: 'Asia\'s biggest dance music festival comes to Gujarat.',
        image_url: 'https://media.pitchfork.com/photos/66dc643d2fc3b8a3424d547f/master/pass/Coldplay.jpg',
        duration: '8h',
        language: 'Music',
        rating: 4.7
      }
    ];

    for (const eventData of eventsData) {
      await Event.create(eventData);
      console.log(`✅ Created event: ${eventData.title} in ${eventData.city}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`📊 Summary:`);
    console.log(`   - ${createdMovies.length} unique movies`);
    console.log(`   - ${createdMovies.length * movieVenues.length * 3} movie shows`);
    console.log(`   - ${sportsData.length} sports events`);
    console.log(`   - ${eventsData.length} general events`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedEvents();
