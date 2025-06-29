const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

try {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    password: process.env.REDIS_PASSWORD || undefined,
    retry_strategy: options => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('Redis server connection refused');
        return new Error('Redis server connection refused');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        logger.error('Redis retry time exhausted');
        return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
        logger.error('Redis connection attempts exceeded');
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    }
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('error', err => {
    logger.warn('Redis client error (continuing without Redis)', err.message);
  });

  // Try to connect, but don't fail if Redis is not available
  redisClient.connect().catch(err => {
    logger.warn(
      'Redis connection failed, continuing without Redis:',
      err.message
    );
    redisClient = null;
  });
} catch (error) {
  logger.warn('Redis setup failed, continuing without Redis:', error.message);
  redisClient = null;
}

module.exports = redisClient;
