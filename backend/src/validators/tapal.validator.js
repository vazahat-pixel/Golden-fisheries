import Joi from 'joi';

export const tapalValidators = {
  assignDriver: Joi.object({
    tapalId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Tapal ID is required',
      'string.pattern.base': 'Tapal ID must be a valid 24-char MongoDB ObjectId'
    }),
    driverId: Joi.string().optional().allow(null, '').pattern(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Driver ID must be a valid 24-char MongoDB ObjectId'
    }),
    driverName: Joi.string().optional().trim().max(120).allow('', null),
    vehicleId: Joi.string().optional().allow(null, '').pattern(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Vehicle ID must be a valid 24-char MongoDB ObjectId'
    })
  }).or('driverId', 'driverName'),

  pickup: Joi.object({
    tapalId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Tapal ID is required',
      'string.pattern.base': 'Tapal ID must be a valid 24-char MongoDB ObjectId'
    }),
    actualPickupQty: Joi.number().required().min(0.1).messages({
      'any.required': 'Actual pickup weight quantity is required',
      'number.min': 'Pickup quantity must be greater than zero'
    })
  }),

  deliver: Joi.object({
    tapalId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Tapal ID is required',
      'string.pattern.base': 'Tapal ID must be a valid 24-char MongoDB ObjectId'
    }),
    actualDeliveredQty: Joi.number().required().min(0.1).messages({
      'any.required': 'Actual delivered weight quantity is required',
      'number.min': 'Delivered quantity must be greater than zero'
    }),
    proofPhotoUrl: Joi.string().allow('', null),
    signatureUrl: Joi.string().allow('', null)
  }),

  logExpense: Joi.object({
    tripId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Trip ID is required'
    }),
    expenseType: Joi.string().valid('FUEL', 'TOLL', 'FOOD', 'REPAIR', 'OTHER').required().messages({
      'any.only': 'Invalid expense category requested'
    }),
    amount: Joi.number().required().min(0.01).messages({
      'any.required': 'Expense amount is required',
      'number.min': 'Expense amount must be greater than zero'
    }),
    receiptUrl: Joi.string().uri().allow('', null),
    remarks: Joi.string().allow('', null)
  })
};
