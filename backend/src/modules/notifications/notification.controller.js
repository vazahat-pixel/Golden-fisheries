import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../utils/appError.js';

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { role, id: userId, fishMallOutletId } = req.user;

      // Filter: Match target user id, role, or outlet id, or broadcast
      const query = {
        $or: [
          { userId },
          { role: role?.toUpperCase() },
        ],
      };

      if (fishMallOutletId) {
        query.$or.push({ outletId: fishMallOutletId });
      }

      // Also allow showing broadcast system notifications (null user and null role)
      query.$or.push({ userId: null, role: null });

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notif = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      if (!notif) {
        return next(new AppError('Notification not found', 404));
      }

      res.status(200).json({
        success: true,
        data: notif,
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const { role, id: userId, fishMallOutletId } = req.user;

      const query = {
        $or: [
          { userId },
          { role: role?.toUpperCase() },
        ],
        read: false,
      };

      if (fishMallOutletId) {
        query.$or.push({ outletId: fishMallOutletId });
      }

      query.$or.push({ userId: null, role: null });

      await Notification.updateMany(query, { read: true });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (err) {
      next(err);
    }
  }

  async registerDeviceToken(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return next(new AppError('Device token is required', 400));
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      if (!user.deviceTokens.includes(token)) {
        user.deviceTokens.push(token);
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: 'Device token registered successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async unregisterDeviceToken(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return next(new AppError('Device token is required', 400));
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      user.deviceTokens = user.deviceTokens.filter((t) => t !== token);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Device token unregistered successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
