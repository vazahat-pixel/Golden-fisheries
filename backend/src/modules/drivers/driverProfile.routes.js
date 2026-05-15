import { Router } from 'express';
import { driverProfileController } from './driverProfile.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverProfileController.create);
router.get('/all', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), driverProfileController.all);
router.get('/active', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), driverProfileController.active);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), driverProfileController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER), driverProfileController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), driverProfileController.delete);

export default router;
