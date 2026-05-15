import { Router } from 'express';
import multer from 'multer';
import { driverController } from './driverProfile.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// ── Multer: memory storage (no disk writes — stream directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and PDF files are allowed.'), false);
    }
  }
});

// Document fields for driver registration
const driverDocFields = upload.fields([
  { name: 'profilePhoto',    maxCount: 1 },
  { name: 'aadhaarFront',    maxCount: 1 },
  { name: 'aadhaarBack',     maxCount: 1 },
  { name: 'panImage',        maxCount: 1 },
  { name: 'licenseFront',    maxCount: 1 },
  { name: 'licenseBack',     maxCount: 1 },
  { name: 'rcImage',         maxCount: 1 },
  { name: 'insuranceImage',  maxCount: 1 },
  { name: 'permitImage',     maxCount: 1 },
  { name: 'pucImage',        maxCount: 1 },
]);

// ─────────────────────────────────────────────
// PUBLIC ROUTE — No auth needed for registration
// ─────────────────────────────────────────────
router.post('/register', driverDocFields, driverController.register);

// ─────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────
router.use(protect);

// Driver can read their own profile
router.get('/my-profile', restrictTo(ROLES.DRIVER, ROLES.ADMIN), driverController.myProfile);

// Admin routes
router.get('/all',    restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverController.all);
router.get('/active', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), driverController.active);
router.get('/:id',    restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverController.getById);

// Admin approval / rejection
router.patch('/:id/approve', restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverController.approve);
router.patch('/:id/reject',  restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverController.reject);

export default router;
