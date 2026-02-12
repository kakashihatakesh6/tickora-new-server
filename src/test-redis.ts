import Redis from 'ioredis';

const redis = new Redis('redis://localhost:6379');

redis.on('connect', () => {
    console.log('Connected to Redis successfully!');
    redis.quit();
});

redis.on('error', (err) => {
    console.error('Failed to connect to Redis:', err.message);
    process.exit(1);
});
