import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
  database: process.env.DB_NAME || process.env.PGDATABASE || 'ticket_master_new',
  username: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
  dialect: 'postgres' as const,
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: (process.env.DB_SSL === 'true' || process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production') ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions
  })
  : new Sequelize(dbConfig);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

export default sequelize;
