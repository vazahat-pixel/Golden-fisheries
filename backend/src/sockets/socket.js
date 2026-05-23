import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { User } from '../modules/users/user.model.js';

let ioInstance = null;

/**
 * Configure and launch Socket.IO Server integrated with our HTTP core
 * @param {import('http').Server} httpServer
 */
export const setupSockets = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin || 'http://localhost:5173',
      credentials: config.cors.credentials,
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  // 1. Connection Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        logger.warn('[Socket Auth Error]: Connection attempt refused. No token provided.');
        return next(new Error('Authentication failed. No token found.'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id).select(
        'phone role fullName isActive businessUnit fishMallOutletId'
      );

      if (!user) {
        logger.warn(`[Socket Auth Error]: Connection attempt refused. User ${decoded.id} not found.`);
        return next(new Error('Authentication failed. User not registered.'));
      }

      if (!user.isActive) {
        logger.warn(`[Socket Auth Error]: Connection attempt refused. User ${user.phone} is suspended.`);
        return next(new Error('Authentication failed. Account suspended.'));
      }

      // Bind user data to socket session
      socket.user = {
        id: user._id.toString(),
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        fishMallOutletId: user.fishMallOutletId?.toString() || null,
      };

      next();
    } catch (err) {
      logger.error(`[Socket Connection Refused]: Handshake verification failed: ${err.message}`);
      return next(new Error('Session expired or invalid. Please log in again.'));
    }
  });

  // 2. Real-Time Events Handler
  io.on('connection', (socket) => {
    logger.info(`[Socket Connected]: Client [${socket.id}] authenticated as User: ${socket.user.fullName} (${socket.user.role})`);

    // Dynamic Room Allocation based on user roles
    socket.join(`user:${socket.user.id}`);
    const normalizedRole = socket.user.role?.toUpperCase();
    socket.join(`role:${normalizedRole}`);

    if ([
      'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT',
      'PROCUREMENT_MANAGER', 'VEHICLE_MANAGER'
    ].includes(normalizedRole)) {
      socket.join('dashboard:updates');
    }

    if (normalizedRole === 'DRIVER') {
      socket.join('drivers:updates');
    }

    if (normalizedRole === 'BUYER') {
      socket.join('buyer:updates');
    }

    const fishMallRoles = ['FISHMALL_MANAGER', 'FISHMALL_CASHIER', 'FISHMALL'];
    if (fishMallRoles.includes(normalizedRole)) {
      socket.join('fishmall:updates');
      if (socket.user.fishMallOutletId) {
        socket.join(`fishmall:outlet:${socket.user.fishMallOutletId}`);
      }
    }

    const restaurantRoles = ['REST_MANAGER', 'REST_CASHIER', 'RESTAURANT'];
    if (restaurantRoles.includes(normalizedRole)) {
      socket.join('restaurant:updates');
    }

    // Driver location tracking broadcast
    socket.on('driver:location_ping', (data) => {
      // Validate tracking data parameters
      const { tripId, latitude, longitude } = data;
      if (!tripId || latitude === undefined || longitude === undefined) return;

      // Broadcast location coordinates to managers and admin monitors
      const payload = {
        driverId: socket.user.id,
        driverName: socket.user.fullName,
        tripId,
        coordinates: { latitude, longitude },
        timestamp: new Date()
      };
      io.to('dashboard:updates').emit('driver:location_update', payload);
      io.to('buyer:updates').emit('driver:location_update', payload);
      io.to(`trip:${tripId}`).emit('driver:location_update', payload);
    });

    // POS status updates synchronization across multiple browsers
    socket.on('pos:table_select', (data) => {
      const { tableNumber, orderId } = data;
      // Broadcast table selection lock details to all other POS sessions
      socket.broadcast.to('role:ADMIN').to('role:MANAGER').emit('pos:table_locked', {
        tableNumber,
        orderId,
        lockedBy: socket.user.fullName
      });
    });

    socket.on('pos:table_release', (data) => {
      const { tableNumber } = data;
      socket.broadcast.to('role:ADMIN').to('role:MANAGER').emit('pos:table_unlocked', { tableNumber });
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket Disconnected]: Client [${socket.id}] closed connection gracefully.`);
    });
  });

  return io;
};

/**
 * Access configured Socket.IO Server Instance globally
 * @returns {import('socket.io').Server}
 */
export const getIo = () => {
  return ioInstance;
};

/**
 * Utility: Broadcast update safely across all layers
 * @param {string} event
 * @param {any} data
 * @param {string} [room]
 */
export const broadcastEvent = (event, data, room = null) => {
  if (!ioInstance) {
    logger.warn(`[Socket IO Sync]: Broadcast blocked. Socket Server not initialized yet for event: ${event}`);
    return;
  }
  if (room) {
    ioInstance.to(room).emit(event, data);
  } else {
    ioInstance.emit(event, data);
  }
};
