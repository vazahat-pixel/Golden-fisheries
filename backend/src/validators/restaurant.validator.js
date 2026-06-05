import Joi from 'joi';

const orderLineSchema = Joi.object({
  menuItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  inventoryItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  name: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  rate: Joi.number().min(0).required(),
});

export const restaurantValidators = {
  createOrder: Joi.object({
    orderType: Joi.string().optional(),
    tableNumber: Joi.string().optional(),
    tableLabel: Joi.string().optional(),
    items: Joi.array().items(orderLineSchema).min(1).required(),
    discountAmount: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).optional(),
    coupon: Joi.string().allow('', null).optional(),
    kitchenTicketId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
    remarks: Joi.string().allow('').optional(),
  }),

  settle: Joi.object({
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'CARD', 'CREDIT', 'SPLIT').optional(),
    cashAmount: Joi.number().min(0).optional(),
    upiAmount: Joi.number().min(0).optional(),
  }),

  createMenu: Joi.object({
    name: Joi.string().required().trim(),
    category: Joi.string().optional(),
    sellingPrice: Joi.number().min(0).optional(),
    price: Joi.number().min(0).optional(),
    gstRate: Joi.number().min(0).max(100).optional(),
    image: Joi.string().optional(),
    recipe: Joi.array()
      .items(
        Joi.object({
          inventoryItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
          itemName: Joi.string().optional(),
          quantityPerServe: Joi.number().positive().required(),
          quantity: Joi.number().positive().optional(),
        })
      )
      .optional(),
  }),

  kitchenTicket: Joi.object({
    orderType: Joi.string().optional(),
    tableNumber: Joi.string().optional(),
    tableLabel: Joi.string().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          menuItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
          name: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          notes: Joi.string().allow('').optional(),
        })
      )
      .min(1)
      .required(),
    remarks: Joi.string().allow('').optional(),
  }),

  wastage: Joi.object({
    inventoryItemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    quantity: Joi.number().positive().required(),
    remarks: Joi.string().allow('').optional(),
  }),
};
