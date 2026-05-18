import { Router } from 'express';
import multer from 'multer';
import { vehicleController } from './vehicle.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { AppError } from '../../utils/appError.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/upload-document', restrictTo(ROLES.ADMIN, ROLES.MANAGER), upload.single('file'), asyncWrapper(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = await cloudinaryService.uploadStream(req.file.buffer, 'vehicles/documents', req.file.originalname);
  res.status(200).json({ success: true, url: result.url });
}));

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER), vehicleController.create);
router.get('/all', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), vehicleController.all);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), vehicleController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER), vehicleController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), vehicleController.delete);

export default router;
