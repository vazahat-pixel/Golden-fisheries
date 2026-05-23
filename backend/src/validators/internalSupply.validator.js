import Joi from 'joi';

const lineSchema = Joi.object({
  fishMallItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().positive().required(),
  rate: Joi.number().min(0).optional(),
});

export const internalSupplyValidators = {
  createRestaurantBill: Joi.object({
    items: Joi.array().items(lineSchema).min(1).required(),
    remarks: Joi.string().allow('').max(2000),
    destinationName: Joi.string().allow('').max(120),
    billDate: Joi.date().optional(),
  }),
};
