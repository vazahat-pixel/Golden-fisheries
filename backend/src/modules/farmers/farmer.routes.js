import { Router } from 'express';
import { farmerController } from './farmer.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_MANAGER), farmerController.create);
router.get('/all', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.PROCUREMENT_MANAGER), farmerController.all);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.PROCUREMENT_MANAGER), farmerController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_MANAGER), farmerController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), farmerController.delete);

export default router;
