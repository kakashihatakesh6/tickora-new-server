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

    // Sync models (create tables if they don't exist, update schema if changed)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');

    const port = process.env.PORT || 8080;
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
