import { Router } from 'express';
import { userController } from './user.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

router.get('/all', userController.all);
router.put('/update/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
