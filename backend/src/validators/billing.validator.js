import Joi from 'joi';

export const billingValidators = {
  create: Joi.object({
    type: Joi.string().valid('SALES', 'PROCUREMENT').required().messages({
      'any.only': 'Billing type must be either SALES or PROCUREMENT'
    }),
    tapalId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
    partyName: Joi.string().required().trim().messages({
      'any.required': 'Party/Recipient name is required'
    }),
    partyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
    items: Joi.array().required().min(1).items(
      Joi.object({
        productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
        productName: Joi.string().required(),
        quantity: Joi.number().required().min(0.1),
        rate: Joi.number().required().min(0)
      })
    ).messages({
      'array.min': 'An invoice must contain at least one billing line item'
    }),
    taxRate: Joi.number().valid(0, 5, 12, 18).default(5),
    paidAmount: Joi.number().min(0).default(0),
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT').default('CASH'),
    dueDate: Joi.date(),
    remarks: Joi.string().allow('', null)
  }),

  payment: Joi.object({
    paymentAmount: Joi.number().required().min(0.01).messages({
      'any.required': 'Payment amount is required',
      'number.min': 'Payment installment must be greater than zero'
    }),
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'BANK_TRANSFER').default('CASH')
  })
};
