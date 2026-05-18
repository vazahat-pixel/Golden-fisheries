import mongoose from 'mongoose';
import multer from 'multer';
import { BaseService } from '../../services/base.service.js';
import { Expense } from './expense.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { AppError } from '../../utils/appError.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';

class ExpenseService extends BaseService {
  constructor() {
    super(Expense);
  }

  /**
   * Search and filter expenses
   */
  async findExpensesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status, expenseType } = queryParams;
    const filter = {};

    if (status) filter.status = status;
    if (expenseType) filter.expenseType = expenseType;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { expenseCode: searchRegex },
        { payee: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit }, 'createdBy approvedBy');
  }

  /**
   * Approve an Expense
   */
  async approve(expenseId, approverId, status) {
    const expense = await this.model.findById(expenseId);
    if (!expense) throw new AppError('Expense entry not found', 404);

    expense.status = status; // APPROVED or REJECTED
    expense.approvedBy = approverId;
    await expense.save();

    return expense;
  }
}

export const expenseService = new ExpenseService();

export const expenseController = {
  create: asyncWrapper(async (req, res) => {
    const expenseData = {
      ...req.body,
      createdBy: req.user.id
    };
    const expense = await expenseService.create(expenseData);
    new ApiResponse(201, { expense }, 'Expense logged successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await expenseService.findExpensesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Expenses fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const expense = await expenseService.findById(req.params.id, 'createdBy approvedBy');
    new ApiResponse(200, { expense }, 'Expense retrieved successfully').send(res);
  }),

  approve: asyncWrapper(async (req, res) => {
    const { status } = req.body; // APPROVED or REJECTED
    const expense = await expenseService.approve(req.params.id, req.user.id, status);
    new ApiResponse(200, { expense }, `Expense has been marked as ${status}`).send(res);
  })
};

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post(
  '/upload-receipt',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.DRIVER),
  upload.single('file'),
  asyncWrapper(async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const result = await cloudinaryService.uploadStream(req.file.buffer, 'expenses/receipts', req.file.originalname);
    res.status(200).json({ success: true, url: result.url });
  })
);

router.post(
  '/create',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.DRIVER),
  expenseController.create
);

router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  expenseController.all
);

router.patch(
  '/approve/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  expenseController.approve
);

router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  expenseController.getById
);

export default router;
