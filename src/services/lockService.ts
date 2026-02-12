import redis from '../config/redis';

const LOCK_TTL = 300; // 5 minutes in seconds

export const acquireLock = async (key: string, value: string, ttl: number = LOCK_TTL): Promise<boolean> => {
    try {
        const result = await redis.set(key, value, 'EX', ttl, 'NX');
        return result === 'OK';
    } catch (error) {
        console.error('Error acquiring lock:', error);
        return false;
    }
};

export const releaseLock = async (key: string, value: string): Promise<boolean> => {
    try {
        const currentValue = await redis.get(key);
        if (currentValue === value) {
            await redis.del(key);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error releasing lock:', error);
        return false;
    }
};

export const checkLock = async (key: string): Promise<string | null> => {
    try {
        return await redis.get(key);
    } catch (error) {
        console.error('Error checking lock:', error);
        return null;
    }
};

export const extendLock = async (key: string, value: string, ttl: number = LOCK_TTL): Promise<boolean> => {
    try {
        const currentValue = await redis.get(key);
        if (currentValue === value) {
            await redis.expire(key, ttl);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error extending lock:', error);
        return false;
    }
};
