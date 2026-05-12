import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { AppError } from '../utils/appError.js';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { User } from '../modules/users/user.model.js';

/**
 * Access protection middleware.
 * Verifies JWT access token and assigns verified user model to request context.
 */
export const protect = asyncWrapper(async (req, res, next) => {
  let token;

  // Retrieve token from Authorization Bearer headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Access denied. No authentication token was found.', 401);
  }

  try {
    // Decode and verify JWT
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Fetch user from DB to verify user status
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // Verify account is active before processing subsequent business logic
    if (!currentUser.isActive) {
      throw new AppError('Your account has been suspended. Please contact Admin.', 403);
    }

    // Bind authenticated user data block to req object
    req.user = {
      id: currentUser._id,
      phone: currentUser.phone,
      role: currentUser.role
    };

    next();
  } catch (err) {
    throw new AppError('Authentication failed. Invalid or expired token.', 401);
  }
});

/**
 * Role authorization gating.
 * Restricts endpoint access to specific authorized user roles.
 * 
 * @param {...string} roles - Approved roles allowed to hit the endpoint (e.g. 'ADMIN', 'MANAGER')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Unauthorized access attempt. You do not have permission to view this resource.', 403)
      );
    }
    next();
  };
};
