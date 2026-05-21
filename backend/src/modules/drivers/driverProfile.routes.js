import { Router } from 'express';
import multer from 'multer';
import { driverController } from './driverProfile.controller.js';
import {
  protect,
  restrictTo,
  requireWeb,
  requireMobile,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, DRIVER_ROLES } from '../../constants/roleGroups.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and PDF files are allowed.'), false);
    }
  },
});

const driverDocFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'panImage', maxCount: 1 },
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
  { name: 'rcImage', maxCount: 1 },
  { name: 'insuranceImage', maxCount: 1 },
  { name: 'permitImage', maxCount: 1 },
  { name: 'pucImage', maxCount: 1 },
]);

const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const mobile = [protect, requireMobile, enforcePlatformPolicy];

router.post('/register', driverDocFields, driverController.register);

router.get('/my-profile', ...mobile, restrictTo(...DRIVER_ROLES, ...WEB_ERP), driverController.myProfile);
router.get('/all', ...web, restrictTo(...WEB_ERP), driverController.all);
router.get('/active', ...web, restrictTo(...WEB_ERP), driverController.active);
router.get('/:id', ...web, restrictTo(...WEB_ERP), driverController.getById);
router.patch('/:id/approve', ...web, restrictTo(...WEB_ERP), driverController.approve);
router.patch('/:id/reject', ...web, restrictTo(...WEB_ERP), driverController.reject);

export default router;
