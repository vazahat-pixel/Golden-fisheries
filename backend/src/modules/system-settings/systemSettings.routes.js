import { Router } from 'express';
import { systemSettingsController } from './systemSettings.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

/** Branding + themes for login screens (no auth). */
router.get('/public', systemSettingsController.getPublic);

/** Authenticated read (full config for admin UI). */
router.get('/', protect, systemSettingsController.get);

router.patch(
  '/',
  protect,
  restrictTo(ROLES.SUPER_ADMIN, 'SUPER_ADMIN'),
  systemSettingsController.update
);

router.post(
  '/reset-section',
  protect,
  restrictTo(ROLES.SUPER_ADMIN, 'SUPER_ADMIN'),
  systemSettingsController.resetSection
);

export default router;
