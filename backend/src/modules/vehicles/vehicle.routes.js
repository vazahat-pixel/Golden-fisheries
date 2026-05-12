import { Router } from 'express';
import { vehicleController } from './vehicle.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER), vehicleController.create);
router.get('/all', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), vehicleController.all);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), vehicleController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER), vehicleController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), vehicleController.delete);

export default router;
