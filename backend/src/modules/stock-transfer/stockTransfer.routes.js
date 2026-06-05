import { Router } from 'express';
import { stockTransferController } from './stockTransfer.controller.js';
import { stockTransferValidators } from '../../validators/stockTransfer.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, PROCUREMENT } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const transferWrite = [...web, restrictTo(...WEB_ERP, ...PROCUREMENT)];
const transferRead = [...web, restrictTo(...WEB_ERP, ...PROCUREMENT)];

router.post(
  '/',
  ...transferWrite,
  validateBody(stockTransferValidators.create),
  stockTransferController.create
);

router.get('/', ...transferRead, stockTransferController.list);

router.get('/:id', ...transferRead, stockTransferController.getById);

router.patch(
  '/:id/approve',
  ...transferWrite,
  restrictTo(...WEB_ERP),
  validateBody(stockTransferValidators.approve),
  stockTransferController.approve
);

router.post(
  '/:id/dispatch',
  ...transferWrite,
  restrictTo(...WEB_ERP),
  stockTransferController.approve
);

router.post(
  '/:id/accept',
  ...web,
  restrictTo(...WEB_ERP, 'FISHMALL_MANAGER', 'FISHMALL'),
  stockTransferController.accept
);

router.patch(
  '/:id/cancel',
  ...transferWrite,
  validateBody(stockTransferValidators.cancel),
  stockTransferController.cancel
);

router.patch('/:id', ...transferWrite, stockTransferController.update);

export default router;

