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

// Load environment variables
dotenv.config();

const seedEvents = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Sync models (force: true drops tables and recreates them)
    await sequelize.sync({ force: true });

    console.log('🗄️  Database synced successfully\n');

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
      { name: 'IMAX Select, CityWalk', city: 'Mumbai' },
      { name: 'Cinepolis, Nexus Mall', city: 'Delhi' },
      { name: 'Inox, R-City', city: 'Mumbai' }
    ];

    const formats = ['2D', '3D', 'IMAX'];
    const screens = ['AUDI 1', 'AUDI 2', 'AUDI 3', 'SCREEN 1', 'SCREEN 2'];

    // Create multiple shows for each movie
    for (const movie of createdMovies) {
      for (const venue of movieVenues) {
        // Create 3-4 shows per venue
        const showCount = 3 + Math.floor(Math.random() * 2);
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
      console.log(`  ➡️  Created ${movieVenues.length * 3} shows for ${movie.title}`);
    }

    // ========== SPORTS ==========
    const sportsData = [
      {
        title: 'IPL Final: CSK vs MI',
        category: 'Cricket',
        city: 'Chennai',
        venue: 'Chepauk Stadium',
        dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: 2500,
        totalSeats: 30000,
        availableSeats: 30000,
        description: 'The ultimate showdown between the two giants of Indian cricket.',
        image_url: 'https://wallpaperaccess.com/full/1887342.jpg',
        duration: '4h',
        rating: 4.7
      },
      {
        title: 'Premier League: Arsenal vs Liverpool',
        category: 'Soccer',
        city: 'London',
        venue: 'Emirates Stadium',
        dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        price: 8000,
        totalSeats: 60000,
        availableSeats: 60000,
        description: 'English Premier League classic match.',
        image_url: 'https://e0.365dm.com/23/04/1600x900/skysports-arsenal-liverpool-premier-league_6115886.jpg',
        duration: '2h',
        rating: 4.6
      },
      {
        title: 'Mumbai City FC vs Mohun Bagan',
        category: 'Football',
        city: 'Mumbai',
        venue: 'Mumbai Football Arena',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        price: 500,
        totalSeats: 8000,
        availableSeats: 7500,
        description: 'ISL intense match-up in the heart of Mumbai.',
        image_url: 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-64300,resizemode-1,msid-81504505/news/sports/mumbai-city-fc-beat-atk-mohun-bagan-2-1-to-clinch-isl-winners-shield.jpg',
        duration: '2h',
        rating: 4.5
      },
      {
        title: 'Pro Kabaddi League: U Mumba vs Jaipur Pink Panthers',
        category: 'Kabaddi',
        city: 'Mumbai',
        venue: 'Dome, NSCI, SVP Stadium',
        dateTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        price: 800,
        totalSeats: 5000,
        availableSeats: 4800,
        description: 'Catch the panga live!',
        image_url: 'https://images.news18.com/ibnlive/uploads/2022/11/pro-kabaddi-league-16677955513x2.jpg',
        duration: '1h 30m',
        rating: 4.4
      },
      {
        title: 'Tata Mumbai Marathon 2026',
        category: 'Marathon',
        city: 'Mumbai',
        venue: 'Chhatrapati Shivaji Maharaj Terminus',
        dateTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        price: 1500,
        totalSeats: 50000,
        availableSeats: 10000,
        description: 'Join the run for the spirit of Mumbai.',
        image_url: 'https://tatamumbaimarathon.procam.in/static-assets/waf-images/8e/58/01/16-9/7w2736b2jW.jpg',
        duration: '6h',
        rating: 4.8
      },
      {
        title: 'Indian Grand Prix: MotoGP',
        category: 'Motorsports',
        city: 'Noida',
        venue: 'Buddh International Circuit',
        dateTime: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        price: 5000,
        totalSeats: 100000,
        availableSeats: 90000,
        description: 'Experience the thrill of speed at India\'s premier race track.',
        image_url: 'https://bsmedia.business-standard.com/_media/bs/img/article/2023-09/22/full/1695384661-8843.jpg',
        duration: '3h',
        rating: 4.9
      },
      {
        title: 'Wimbledon 2026 Screening',
        category: 'Tennis',
        city: 'Mumbai',
        venue: 'Jio World Drive',
        dateTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        price: 1000,
        totalSeats: 200,
        availableSeats: 150,
        description: 'Live screening of the Wimbledon finals with food and drinks.',
        image_url: 'https://www.wimbledon.com/images/ios/iphone_1242_2208/2023_gentlemens_singles_final_alcaraz_celebration_1_1689528657.jpg',
        duration: '4h',
        rating: 4.3
      }
    ];

    for (const sportData of sportsData) {
      await Sport.create(sportData);
      console.log(`✅ Created sport: ${sportData.title} (${sportData.category})`);
    }

    // ========== EVENTS ==========
    const eventsData = [
      {
        title: 'Coldplay World Tour',
        eventType: EventType.CONCERT,
        city: 'Mumbai',
        venue: 'DY Patil Stadium',
        dateTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        price: 5000,
        totalSeats: 45000,
        availableSeats: 45000,
        description: 'Experience the magic of Coldplay live in concert.',
        image_url: 'https://media.pitchfork.com/photos/66dc643d2fc3b8a3424d547f/master/pass/Coldplay.jpg',
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
        dateTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        price: 1500,
        totalSeats: 5000,
        availableSeats: 5000,
        description: 'Soulful melodies by the one and only Arijit Singh.',
        image_url: 'https://in.bmscdn.com/events/moviecard/ET00342407.jpg',
        duration: '3h',
        language: 'Hindi',
        rating: 4.8,
        cast: [
          { name: 'Arijit Singh', role: 'Singer', image: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/arijit-singh-1048083-24-03-2017-18-02-14.jpg' }
        ],
        crew: []
      }
    ];

    for (const eventData of eventsData) {
      await Event.create(eventData);
      console.log(`✅ Created event: ${eventData.title}`);
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
