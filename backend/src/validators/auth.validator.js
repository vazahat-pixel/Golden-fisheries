import Joi from 'joi';
import { ROLE_LIST } from '../constants/roles.js';
import { PORTAL_LIST } from '../constants/authPortals.js';
import { sendError } from '../utils/response.js';

/**
 * Authentication input schemas validation utilizing Joi.
 * Validates inputs BEFORE they reach controllers or database models, preventing pollution.
 */
export const authValidators = {
  // Validate User Registration payload
  register: Joi.object({
    fullName: Joi.string().required().min(3).max(100).messages({
      'any.required': 'Full Name is required',
      'string.min': 'Full Name must be at least 3 characters'
    }),
    phone: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
      'any.required': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    password: Joi.string().required().min(6).messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
    role: Joi.string().valid(...ROLE_LIST).required().messages({
      'any.required': 'User role is required',
      'any.only': `Role must be one of: ${ROLE_LIST.join(', ')}`
    })
  }).unknown(true),

  // Validate OTP dispatch parameters
  sendOtp: Joi.object({
    phone: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
      'any.required': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    loginPortal: Joi.string().valid(...PORTAL_LIST).optional()
  }),

  // Validate OTP check arguments
  verifyOtp: Joi.object({
    phone: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
      'any.required': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    loginPortal: Joi.string().valid(...PORTAL_LIST).optional(),
    otp: Joi.string().required().min(4).max(6).pattern(/^[0-9]+$/).messages({
      'any.required': 'OTP is required',
      'string.min': 'OTP must be at least 4 characters long',
      'string.max': 'OTP cannot exceed 6 characters',
      'string.pattern.base': 'OTP must contain only digits'
    })
  }),

  // Validate standard credential logins
  login: Joi.object({
    phone: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
      'any.required': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Validate token refresh requests
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  })
};

/**
 * Express middleware helper to execute validation schemas.
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return sendError(res, 'Validation failed', 400, errors);
    }
    next();
  };
};
