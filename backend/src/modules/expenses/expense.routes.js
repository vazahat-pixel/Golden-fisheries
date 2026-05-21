import mongoose from 'mongoose';
import multer from 'multer';
import { BaseService } from '../../services/base.service.js';
import { Expense } from './expense.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import {
  protect,
  restrictTo,
  requireMobile,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { DRIVER_ROLES, WEB_ERP } from '../../constants/roleGroups.js';
import { AppError } from '../../utils/appError.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';

class ExpenseService extends BaseService {
  constructor() {
    super(Expense);
  }

  async findExpensesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status, expenseType } = queryParams;
    const filter = {};

    if (status) filter.status = status;
    if (expenseType) filter.expenseType = expenseType;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ expenseCode: searchRegex }, { payee: searchRegex }];
    }

    return await this.findMany(filter, { page, limit }, 'createdBy approvedBy');
  }

  async approve(expenseId, approverId, status) {
    const expense = await this.model.findById(expenseId);
    if (!expense) throw new AppError('Expense entry not found', 404);

    expense.status = status;
    expense.approvedBy = approverId;
    await expense.save();

    if (expense.linkedTripId) {
      const TripModel = mongoose.model('Trip');
      const trip = await TripModel.findById(expense.linkedTripId);
      if (trip?.postTripExpenses) {
        trip.postTripExpenses.status = status;
        trip.postTripExpenses.reviewedBy = approverId;
        trip.postTripExpenses.reviewedAt = new Date();
        for (const exp of trip.expenses) {
          exp.status = status;
        }
        await trip.save();
      }
    }

    return expense;
  }
}

export const expenseService = new ExpenseService();

export const expenseController = {
  create: asyncWrapper(async (req, res) => {
    const expense = await expenseService.create({ ...req.body, createdBy: req.user.id });
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
    const { status } = req.body;
    const expense = await expenseService.approve(req.params.id, req.user.id, status);
    new ApiResponse(200, { expense }, `Expense has been marked as ${status}`).send(res);
  }),
};

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const mobile = [protect, requireMobile, enforcePlatformPolicy];
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.post(
  '/upload-receipt',
  ...mobile,
  restrictTo(...DRIVER_ROLES),
  upload.single('file'),
  asyncWrapper(async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const result = await cloudinaryService.uploadStream(
      req.file.buffer,
      'expenses/receipts',
      req.file.originalname
    );
    new ApiResponse(200, { url: result.url }, 'Receipt uploaded successfully').send(res);
  })
);

router.post('/create', ...mobile, restrictTo(...DRIVER_ROLES), expenseController.create);
router.get('/all', ...web, restrictTo(...WEB_ERP), expenseController.all);
router.patch('/approve/:id', ...web, restrictTo(...WEB_ERP), expenseController.approve);
router.get('/:id', ...web, restrictTo(...WEB_ERP), expenseController.getById);

export default router;
