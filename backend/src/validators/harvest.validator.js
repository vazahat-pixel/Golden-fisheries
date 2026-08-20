import Joi from 'joi';

export const harvestValidators = {
  create: Joi.object({
    farmerId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Farmer reference ID is required',
      'string.pattern.base': 'Farmer ID must be a valid 24-char MongoDB ObjectId'
    }),
    harvestDate: Joi.date().required().messages({
      'any.required': 'Harvest date is required',
      'date.base': 'Harvest date must be a valid Date calendar entry'
    }),
    pickupDate: Joi.date().required().messages({
      'any.required': 'Pickup date is required',
      'date.base': 'Pickup date must be a valid Date calendar entry'
    }),
    pickupTime: Joi.string().allow('', null),
    pickupLocation: Joi.string().required().trim().messages({
      'any.required': 'Pickup address/coordinates location is required'
    }),
    logisticsNotes: Joi.string().allow('', null),
    remarks: Joi.string().allow('', null),
    vehicleNo: Joi.string().allow('', null),
    driverName: Joi.string().allow('', null),
    graderName: Joi.string().allow('', null),
    damageComplaint: Joi.string().allow('', null),
    deductionsNotes: Joi.string().allow('', null),
    tds: Joi.number().min(0).allow(null),
    commission: Joi.number().min(0).allow(null),
    soft: Joi.number().min(0).allow(null),
    products: Joi.array().required().min(1).items(
      Joi.object({
        productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
          'any.required': 'Product ID is required',
          'string.pattern.base': 'Product ID must be a valid 24-char MongoDB ObjectId'
        }),
        hsnCode: Joi.string().allow('', null),
        fishName: Joi.string().required().messages({
          'any.required': 'Fish display name is required'
        }),
        estimatedQty: Joi.number().required().min(0.1).messages({
          'any.required': 'Estimated quantity is required',
          'number.min': 'Estimated quantity must be greater than zero'
        }),
        rate: Joi.number().min(0).allow(null),
        count: Joi.string().allow('', null),
        boxCount: Joi.number().integer().min(1).allow(null),
        weightPerBox: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).allow(null),
        qualityType: Joi.string().valid('A', 'B', 'Mix').default('Mix')
      })
    ).messages({
      'array.min': 'At least one product item must be added to the harvest slip'
    })
  }),

  update: Joi.object({
    farmerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    harvestDate: Joi.date(),
    pickupDate: Joi.date(),
    pickupTime: Joi.string().allow('', null),
    pickupLocation: Joi.string().trim(),
    logisticsNotes: Joi.string().allow('', null),
    remarks: Joi.string().allow('', null),
    tds: Joi.number().min(0).allow(null),
    commission: Joi.number().min(0).allow(null),
    soft: Joi.number().min(0).allow(null),
    products: Joi.array().min(1).items(
      Joi.object({
        productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
        fishName: Joi.string().required(),
        estimatedQty: Joi.number().required().min(0.1),
        rate: Joi.number().min(0).allow(null),
        boxCount: Joi.number().integer().min(1).allow(null),
        weightPerBox: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).allow(null),
        qualityType: Joi.string().valid('A', 'B', 'Mix')
      })
    )
  }),

  patchStatus: Joi.object({
    status: Joi.string()
      .valid(
        'DRAFT',
        'PENDING',
        'SENT',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'REJECTED'
      )
      .required()
      .messages({
        'any.only': 'Invalid harvest slip state requested',
      }),
    reason: Joi.string().allow('', null),
  }),

  reject: Joi.object({
    reason: Joi.string().allow('', null),
  }),

  /** Web ERP farmer approval — same allowed transitions as mobile patch */
  approveStatus: Joi.object({
    status: Joi.string()
      .valid('PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED')
      .required(),
    reason: Joi.string().allow('', null),
  }),
};
