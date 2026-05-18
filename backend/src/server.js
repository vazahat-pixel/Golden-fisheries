import { app } from './app.js';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';
import { setupSockets } from './sockets/socket.js';

// ==========================================
// 1. Capture Synchronous Exceptions
// ==========================================
process.on('uncaughtException', (err) => {
  logger.error(`[CRITICAL - Uncaught Exception]: ${err.message}\nStack: ${err.stack}`);
  logger.warn('Server process stopping immediately due to an unhandled exception...');
  process.exit(1);
});

// ==========================================
// 2. Establish DB Connection
// ==========================================
await connectDB();

// ==========================================
// 3. Start Express HTTP Server
// ==========================================
const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(`  GOLDEN FISHERIES ERP BACKEND BASE ACTIVATED          `);
  logger.info(`  Listening Port: ${config.port}                        `);
  logger.info(`  Execution Mode: ${config.env.toUpperCase()}          `);
  logger.info(`=======================================================`);
});

// ==========================================
// 4. Initialize Socket.IO Server Layer
// ==========================================
setupSockets(server);
logger.info(`[Socket Engine]: Socket.IO event router listening on active HTTP port.`);

// ==========================================
// 5. Capture Unhandled Promise Rejections
// ==========================================
process.on('unhandledRejection', (err) => {
  logger.error(`[CRITICAL - Unhandled Rejection]: ${err.message}\nStack: ${err.stack}`);
  logger.warn('Shutting down server connection pools gracefully before exit...');
  
  server.close(() => {
    logger.info('HTTP Server instance closed. Process terminating...');
    process.exit(1);
  });
});

// ==========================================
// 6. Graceful Shutdown Handlers
// ==========================================
const gracefulShutdown = (signal) => {
  logger.info(`[Process]: Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP Server closed.');
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during DB closure: ${err.message}`);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

