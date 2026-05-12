import { Router } from 'express';
import { productController } from './product.service.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/create', restrictTo(ROLES.ADMIN, ROLES.MANAGER), productController.create);
router.get('/all', productController.all); // Open read to all authenticated roles for POS/Mall
router.get('/:id', productController.getById);
router.put('/update/:id', restrictTo(ROLES.ADMIN, ROLES.MANAGER), productController.update);
router.delete('/:id', restrictTo(ROLES.ADMIN), productController.delete);

export default router;
