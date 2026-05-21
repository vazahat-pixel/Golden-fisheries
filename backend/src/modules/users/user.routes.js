import { Router } from 'express';
import { userController } from './user.service.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.use(...web);
router.use(restrictTo(...WEB_ERP));

router.get('/all', userController.all);
router.put('/update/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
