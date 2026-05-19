import { Router } from 'express';
import { farmerLedgerController } from './farmerLedger.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_MANAGER));

router.get('/summary', farmerLedgerController.summary);
router.get('/:farmerId', farmerLedgerController.getLedger);
router.post('/payment', farmerLedgerController.createPayment);

export default router;
