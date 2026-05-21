import { Router } from 'express';
import { config } from '../../config/config.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';
import { smsService } from '../../services/sms.service.js';
import { whatsappService } from '../../services/whatsapp.service.js';
import { mapsService } from '../../services/maps.service.js';
import { AppError } from '../../utils/appError.js';

const router = Router();

/** Public status — which integrations are configured (no secrets exposed) */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Integration status',
    data: {
      sms: {
        enabled: config.integrations.sms.enabled,
        provider: config.integrations.sms.provider,
        forceSendInDev: config.integrations.sms.forceSendInDev
      },
      whatsapp: {
        enabled: config.integrations.whatsapp.enabled,
        apiVersion: config.integrations.whatsapp.apiVersion
      },
      maps: {
        enabled: config.integrations.maps.enabled,
        region: config.integrations.maps.region,
        navigationWorksWithoutKey: true
      }
    }
  });
});

router.use(protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP));

/** POST body: { phone, message } — 10-digit Indian mobile */
router.post(
  '/test/sms',
  asyncWrapper(async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      throw new AppError('phone and message are required', 400);
    }
    if (!smsService.isConfigured()) {
      throw new AppError('SMS_API_KEY is not set in .env', 503);
    }
    const result = await smsService.sendMessage(phone, message);
    new ApiResponse(200, result, 'SMS test dispatched').send(res);
  })
);

/** POST body: { phone, message } */
router.post(
  '/test/whatsapp',
  asyncWrapper(async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      throw new AppError('phone and message are required', 400);
    }
    if (!whatsappService.isConfigured()) {
      throw new AppError('WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID required in .env', 503);
    }
    const result = await whatsappService.sendText(phone, message);
    new ApiResponse(200, result, 'WhatsApp test dispatched').send(res);
  })
);

/** GET query: ?address=Mangalore */
router.get(
  '/test/maps/geocode',
  asyncWrapper(async (req, res) => {
    if (!mapsService.isGeocodeEnabled()) {
      throw new AppError('GOOGLE_MAPS_API_KEY is not set in .env', 503);
    }
    const result = await mapsService.geocodeAddress(req.query.address);
    new ApiResponse(200, result, 'Geocode test successful').send(res);
  })
);

export default router;
