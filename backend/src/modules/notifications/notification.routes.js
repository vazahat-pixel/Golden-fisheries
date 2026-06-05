import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect all notification routes
router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/register-device-token', notificationController.registerDeviceToken);
router.post('/unregister-device-token', notificationController.unregisterDeviceToken);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
