import Joi from 'joi';

export const inventoryValidators = {
  adjust: Joi.object({
    productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'any.required': 'Product ID is required',
      'string.pattern.base': 'Product ID must be a valid 24-char MongoDB ObjectId'
    }),
    quantityChange: Joi.number().required().not(0).messages({
      'any.required': 'Stock quantity change is required',
      'number.not': 'Quantity change cannot be exactly zero'
    }),
    remarks: Joi.string().required().trim().min(5).messages({
      'any.required': 'Audit remarks reason is required',
      'string.min': 'Audit remarks must be at least 5 characters long'
    })
  })
};
