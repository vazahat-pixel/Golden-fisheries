import { Router } from 'express';
import { productController } from './product.service.js';
import { protect, restrictTo, requireWeb, enforcePlatformPolicy, blockMobileWrite } from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.use(protect);

router.post('/create', ...web, restrictTo(...WEB_ERP), productController.create);
router.get('/all', productController.all);
router.get('/:id', productController.getById);
router.put('/update/:id', ...web, restrictTo(...WEB_ERP), productController.update);
router.delete('/:id', ...web, restrictTo(...WEB_ERP), productController.delete);

export default router;
