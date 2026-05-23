import Joi from 'joi';

const lineSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().positive().required(),
  rate: Joi.number().min(0).optional(),
});

export const stockTransferValidators = {
  create: Joi.object({
    destinationOutletId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    lines: Joi.array().items(lineSchema).min(1).required(),
    notes: Joi.string().allow('').max(2000),
    transferDate: Joi.date().optional(),
    status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL').optional(),
  }),
  approve: Joi.object({
    notes: Joi.string().allow('').max(2000).optional(),
  }),
  cancel: Joi.object({
    cancelReason: Joi.string().required().trim().min(3).max(500),
  }),
};
