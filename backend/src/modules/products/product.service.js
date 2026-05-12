import { BaseService } from '../../services/base.service.js';
import { Product } from './product.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

class ProductService extends BaseService {
  constructor() {
    super(Product);
  }

  /**
   * Search and filter products
   */
  async findProductsWithFilters(queryParams) {
    const { page = 1, limit = 10, search, category, isActive } = queryParams;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { scientificName: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }
}

export const productService = new ProductService();

export const productController = {
  create: asyncWrapper(async (req, res) => {
    const product = await productService.create(req.body);
    new ApiResponse(201, { product }, 'Product registered successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await productService.findProductsWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Products fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const product = await productService.findById(req.params.id);
    new ApiResponse(200, { product }, 'Product retrieved successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const product = await productService.updateById(req.params.id, req.body);
    new ApiResponse(200, { product }, 'Product updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await productService.deleteById(req.params.id);
    new ApiResponse(200, null, 'Product deleted successfully').send(res);
  })
};
