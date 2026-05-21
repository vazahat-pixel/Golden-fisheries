import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { AppError } from '../utils/appError.js';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { User } from '../modules/users/user.model.js';
import { sendError } from '../utils/response.js';
import { ROLES, normalizeRole, isSuperAdmin } from '../constants/roles.js';
import { PLATFORM_ACCESS } from '../constants/platformAccess.js';
import { roleMatches } from '../constants/roleGroups.js';

const extractBearer = (req) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const resolveClientPlatform = (req) => {
  const header = (req.headers['x-client-platform'] || req.headers['x-platform'] || '')
    .toString()
    .toUpperCase();
  if (header === PLATFORM_ACCESS.MOBILE || header === PLATFORM_ACCESS.WEB) {
    return header;
  }
  return null;
};

/**
 * Verifies JWT and attaches full user document (minus password).
 */
export const protect = asyncWrapper(async (req, res, next) => {
  const token = extractBearer(req) || req.cookies?.accessToken;

  if (!token) {
    throw new AppError('Access denied. No authentication token was found.', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }
    if (!currentUser.isActive) {
      throw new AppError('Your account has been suspended. Please contact Admin.', 403);
    }

    req.user = currentUser;
    req.userRole = normalizeRole(currentUser.role);
    req.clientPlatform = resolveClientPlatform(req);
    next();
  } catch (err) {
    if (err instanceof AppError || err.statusCode) {
      throw err;
    }
    throw new AppError('Authentication failed. Invalid or expired token.', 401);
  }
});

/**
 * Role authorization — supports legacy role strings in DB.
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roleMatches(req.user.role, roles)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user?.role || 'none'}`,
        403
      );
    }
    next();
  };
};

export const requireRole = restrictTo;

/** Web ERP panel — blocks mobile-only field roles */
export const requireWeb = (req, res, next) => {
  const web = req.user?.platformAccess?.web !== false;
  if (!web) {
    return sendError(res, 'Web access is not enabled for your account.', 403);
  }
  const client = req.clientPlatform;
  if (client === PLATFORM_ACCESS.MOBILE && !isSuperAdmin(req.user.role)) {
    return sendError(res, 'This endpoint requires web ERP access.', 403);
  }
  next();
};

/** Mobile / field app routes */
export const requireMobile = (req, res, next) => {
  const mobile = req.user?.platformAccess?.mobile !== false;
  if (!mobile) {
    return sendError(res, 'Mobile access is not enabled for your account.', 403);
  }
  const client = req.clientPlatform;
  if (client === PLATFORM_ACCESS.WEB) {
    const webOnlyRoles = [
      ROLES.REST_MANAGER,
      ROLES.REST_CASHIER,
      ROLES.FISHMALL_MANAGER,
      ROLES.FISHMALL_CASHIER,
    ];
    if (webOnlyRoles.includes(req.userRole)) {
      return sendError(res, 'This endpoint requires mobile app access.', 403);
    }
  }
  next();
};

/**
 * Restaurant vs FishMall panel isolation.
 */
export const requireBusinessUnit = (...units) => {
  return (req, res, next) => {
    if (isSuperAdmin(req.user.role)) return next();

    const role = req.userRole;
    if (units.includes('REST') && [ROLES.REST_MANAGER, ROLES.REST_CASHIER].includes(role)) {
      return next();
    }
    if (units.includes('FISHMALL') && [ROLES.FISHMALL_MANAGER, ROLES.FISHMALL_CASHIER].includes(role)) {
      return next();
    }

    const bu = req.user.businessUnit || 'MKE';
    if (!units.includes(bu)) {
      return sendError(res, `Access denied. This resource is restricted to: ${units.join(', ')}`, 403);
    }
    next();
  };
};

/** SUPER_ADMIN mobile: monitor only — no create/update/delete */
export const blockMobileWrite = (req, res, next) => {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const isMobileClient = req.clientPlatform === PLATFORM_ACCESS.MOBILE;
  const viewOnly = req.user?.platformAccess?.mobileViewOnly === true;

  if (isMobileClient && isSuperAdmin(req.user.role) && viewOnly && writeMethods.includes(req.method)) {
    return sendError(res, 'Write operations are not allowed in mobile view-only mode.', 403);
  }
  next();
};

/** Apply to all authenticated API traffic */
export const enforcePlatformPolicy = (req, res, next) => {
  const role = req.userRole;
  const client = req.clientPlatform;
  if (!client) return next();

  const webOnly = [
    ROLES.REST_MANAGER,
    ROLES.REST_CASHIER,
    ROLES.FISHMALL_MANAGER,
    ROLES.FISHMALL_CASHIER,
  ];
  const mobileOnly = [
    ROLES.PROCUREMENT_MANAGER,
    ROLES.BUYER,
    ROLES.DRIVER,
    ROLES.VEHICLE_MANAGER,
  ];

  if (client === PLATFORM_ACCESS.WEB && mobileOnly.includes(role)) {
    return sendError(res, 'Your role is restricted to the mobile application.', 403);
  }
  if (client === PLATFORM_ACCESS.MOBILE && webOnly.includes(role)) {
    return sendError(res, 'Your role is restricted to the web panel.', 403);
  }
  return next();
};
