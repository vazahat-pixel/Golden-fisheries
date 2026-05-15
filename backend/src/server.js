import { app } from './app.js';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';
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

