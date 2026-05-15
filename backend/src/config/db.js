import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

/**
 * Database connection coordinator.
 * Connects to MongoDB and sets up lifecycle event listeners.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info(`[MongoDB Connection Success]: Connected to Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`[MongoDB Atlas Failure]: ${error.message}`);
    logger.info('Attempting local MongoDB fallback (localhost:27017)...');
    
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/golden_fisheries', config.mongodb.options);
      logger.info(`[MongoDB Local Success]: Connected to Local Host: ${localConn.connection.host}`);
    } catch (localError) {
      logger.error(`[MongoDB Total Failure]: Local fallback also failed. ${localError.message}`);
      process.exit(1);
    }
  }
};

// Monitor connection events to track pool health and connectivity drops
mongoose.connection.on('error', (err) => {
  logger.error(`[Mongoose Runtime Error]: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('[Mongoose Event]: Connection disconnected.');
});

// Graceful termination for clean process exits without connection leaks
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('[Process Exit]: Mongoose connection closed gracefully.');
  process.exit(0);
});
