import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/appError.js';
import { sanitizeMongoQueries, sanitizeXSS, authRateLimiter, generalApiLimiter } from './middleware/security.middleware.js';


// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import farmerRoutes from './modules/farmers/farmer.routes.js';
import buyerRoutes from './modules/buyers/buyer.routes.js';
import productRoutes from './modules/products/product.routes.js';
import vehicleRoutes from './modules/vehicles/vehicle.routes.js';
import driverProfileRoutes from './modules/drivers/driverProfile.routes.js'; // multipart-aware driver routes
import harvestRoutes from './modules/harvests/harvest.routes.js';
import tapalRoutes from './modules/tapals/tapal.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import restaurantRoutes from './modules/restaurant/restaurant.routes.js';
import fishmallRoutes from './modules/fishmall/fishmall.routes.js';
import expenseRoutes from './modules/expenses/expense.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import userRoutes from './modules/users/user.routes.js';
import farmerLedgerRoutes from './modules/farmer-ledger/farmerLedger.routes.js';

const app = express();

// ==========================================
// 1. Core Security Headers & Middleware
// ==========================================
app.use(helmet()); // Sets standard security response headers (XSS, Clickjacking protection)

app.use(cors({
  origin: [
    config.cors.origin,
    'https://golden-fisheries.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175'
  ],
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// HTTP logging mapped using winston + morgan
app.use(loggingMiddleware);

// ==========================================
// 2. Request Parsers & Sanitizers
// ==========================================
app.use(express.json({ limit: '50kb' })); // Supports driver registration metadata
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Anti-injection & XSS security filters
app.use(sanitizeMongoQueries);
app.use(sanitizeXSS);


// ==========================================
// 3. API Routes Mounting
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Golden Fisheries ERP API service active.',
    timestamp: new Date().toISOString()
  });
});

// Apply specific rate limit rules before mounting routes
app.use('/api/v1/auth', authRateLimiter, authRoutes);

// General traffic limits for other operational routes
app.use('/api/v1', generalApiLimiter);

app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/buyers', buyerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/drivers', driverProfileRoutes);
app.use('/api/v1/harvests', harvestRoutes);
app.use('/api/v1/tapals', tapalRoutes);

app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/api/v1/fishmall', fishmallRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/farmer-ledger', farmerLedgerRoutes);


// ==========================================
// 4. Mapped 404 Route Exceptions
// ==========================================
app.all('*', (req, res, next) => {
  next(new AppError(`MAPPED ENDPOINT NOT FOUND: [${req.method}] ${req.originalUrl}`, 404));
});

// ==========================================
// 5. Global Exception Handlers
// ==========================================
app.use(errorHandler);

export default app;
export { app };
