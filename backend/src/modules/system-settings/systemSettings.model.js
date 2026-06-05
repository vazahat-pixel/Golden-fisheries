import mongoose from 'mongoose';
import { SETTINGS_SINGLETON_ID } from './defaultSettings.js';

const systemSettingsSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: SETTINGS_SINGLETON_ID,
      unique: true,
      immutable: true,
    },
    branding: { type: mongoose.Schema.Types.Mixed, default: {} },
    numbering: { type: mongoose.Schema.Types.Mixed, default: {} },
    themes: { type: mongoose.Schema.Types.Mixed, default: {} },
    print: { type: mongoose.Schema.Types.Mixed, default: {} },
    panels: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, minimize: false }
);

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
