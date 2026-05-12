import { Router } from 'express';
import { buyerController } from './buyer.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER), buyerController.create);
router.get('/all', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), buyerController.all);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT), buyerController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER), buyerController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), buyerController.delete);

export default router;
