import { Router } from 'express';
import multer from 'multer';
import { vehicleController } from './vehicle.service.js';
import {
  protect,
  restrictTo,
  requireMobile,
  enforcePlatformPolicy,
} from '../../middleware/auth.middleware.js';
import { VEHICLE_ROLES, WEB_ERP } from '../../constants/roleGroups.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { AppError } from '../../utils/appError.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const mobile = [protect, requireMobile, enforcePlatformPolicy];

router.post(
  '/upload-document',
  ...mobile,
  restrictTo(...VEHICLE_ROLES),
  upload.single('file'),
  asyncWrapper(async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const result = await cloudinaryService.uploadStream(
      req.file.buffer,
      'vehicles/documents',
      req.file.originalname
    );
    new ApiResponse(200, { url: result.url }, 'Document uploaded successfully').send(res);
  })
);

router.post('/create', ...mobile, restrictTo(...VEHICLE_ROLES), vehicleController.create);
router.get('/all', ...mobile, restrictTo(...VEHICLE_ROLES), vehicleController.all);
router.get('/:id', ...mobile, restrictTo(...VEHICLE_ROLES), vehicleController.getById);
router.put('/update/:id', ...mobile, restrictTo(...VEHICLE_ROLES), vehicleController.update);
router.delete('/:id', ...mobile, restrictTo(...WEB_ERP), vehicleController.delete);

export default router;
