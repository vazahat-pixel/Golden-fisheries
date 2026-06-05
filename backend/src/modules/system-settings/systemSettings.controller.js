import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import {
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettingsSection,
} from './systemSettings.service.js';

export const systemSettingsController = {
  getPublic: asyncWrapper(async (req, res) => {
    const settings = await getSystemSettings();
    new ApiResponse(200, {
      settings: {
        branding: settings.branding,
        themes: settings.themes,
      },
    }, 'Public settings loaded').send(res);
  }),

  get: asyncWrapper(async (req, res) => {
    const settings = await getSystemSettings();
    new ApiResponse(200, { settings }, 'System settings loaded').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const settings = await updateSystemSettings(req.body, req.user?.id || req.user?._id);
    new ApiResponse(200, { settings }, 'System settings saved').send(res);
  }),

  resetSection: asyncWrapper(async (req, res) => {
    const { section } = req.body;
    const settings = await resetSystemSettingsSection(section, req.user?.id || req.user?._id);
    new ApiResponse(200, { settings }, `Section "${section}" reset to defaults`).send(res);
  }),
};
