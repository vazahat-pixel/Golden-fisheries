import Joi from 'joi';

export const fishMallOutletValidators = {
  create: Joi.object({
    name: Joi.string().required().trim().min(2).max(120),
    location: Joi.string().allow('').max(200),
    phone: Joi.string().allow('').max(20),
    email: Joi.string().allow('').max(120),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    location: Joi.string().allow('').max(200),
    phone: Joi.string().allow('').max(20),
    email: Joi.string().email().allow(''),
    isDefault: Joi.boolean(),
    isActive: Joi.boolean(),
  }).min(1),
};
