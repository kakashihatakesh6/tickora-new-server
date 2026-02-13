import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup singleton for development/hot-reloading
const globalForRedis = global as unknown as { redis: Redis };

// Use existing instance if available, otherwise create new one
const redis = globalForRedis.redis || new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Disable max retries per request to prevent errors on long-running commands or unstable connections
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Explicitly fallback to auto family if needed, though usually fine
});

// In development, save the instance to global to persist across hot reloads
if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

// Only attach event listeners if they haven't been attached yet
// We can check listener count to avoid duplicate logs
if (redis.listenerCount('connect') === 0) {
    redis.on('connect', () => {
        console.log('Redis connected');
    });

    redis.on('reconnecting', () => {
        console.log('Redis reconnecting...');
    });

    redis.on('error', (err) => {
        console.error('Redis error:', err);
    });
}

export default redis;
