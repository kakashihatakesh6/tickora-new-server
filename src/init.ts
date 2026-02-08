import { Client } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import sequelize from './config/database';
// Import all models through index to ensure proper association setup
import { User, Event, Booking, Ticket } from './models/index';

dotenv.config();

const createDatabaseIfNotExists = async () => {
  const dbName = process.env.DB_NAME || 'ticket_master_new';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432');

  console.log(`Checking if database '${dbName}' exists...`);

  // Connect to default 'postgres' database to manage databases
  const client = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    } else {
      console.log(`ℹ️  Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error('❌ Error checking/creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const initTables = async () => {
  console.log('Syncing database tables...');
  try {
    await sequelize.authenticate();
    
    const models = Object.keys(sequelize.models);
    console.log(`📋 Registered models (${models.length}):`, models.join(', '));
    
    // Sync all models - alter: true will update tables if they exist but are different
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced successfully!');
    
    // Verify tables in database
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('📂 Tables in DB:', results.map((r: any) => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Error syncing tables:', error);
    process.exit(1);
  }
};

const verifySeed = async () => {
  console.log('Verifying seeded data...');
  try {
    const count = await Event.count();
    console.log(`\n📊 Total events in database: ${count}`);
    
    if (count > 0) {
      const events = await Event.findAll({ limit: 3 });
      console.log('🔍 First 3 events:');
      events.forEach(e => console.log(` - ${e.title} (${e.eventType})`));
      console.log('\n✅ Verification successful!');
    } else {
      console.error('\n❌ No events found in database after seeding!');
      // We don't exit here, just log error, or maybe we should exit? 
      // User asked to make sure logic is here.
      process.exit(1); 
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
};

const run = async () => {
  await createDatabaseIfNotExists();
  await initTables();
  
  console.log('Running seeds...');
  try {
    // Run the seed script using ts-node
    execSync('npx ts-node src/seed.ts', { stdio: 'inherit' });
  } catch (error) {
    // Seed script might fail if data already exists (depending on implementation), but we continue
    console.error('⚠️  Seed script finished with error (check logs above).');
    process.exit(1);
  }

  await verifySeed();
};

run();
