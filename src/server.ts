import dotenv from 'dotenv';
import app from './app';
import sequelize, { connectDatabase } from './config/database';
import { User, Event, Booking, Ticket } from './models/index';

// Load environment variables
dotenv.config();

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Sync models - only sync in dev or if explicitly requested to avoid startup overhead in serverless
    if (process.env.NODE_ENV !== 'production' || process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    }

    const port = process.env.PORT || 8080;

    // Vercel handles the listening if we export the app, but for local dev we need this
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment');
    } else {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    // In serverless, we might not want to hard-exit as it can cause cyclic crashes
    // but for now, we'll keep it to see logs if it fails
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

// Export for Vercel
export { startServer };
