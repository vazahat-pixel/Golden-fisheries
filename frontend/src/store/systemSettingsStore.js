import { create } from 'zustand';
import { systemSettingsService } from '../services/systemSettingsService';
import { applySystemThemes, applyBrandingToDocument } from '../utils/applySystemTheme';

const empty = {
  branding: {},
  numbering: {},
  themes: {},
  print: {},
  panels: {},
};

export const useSystemSettingsStore = create((set, get) => ({
  settings: empty,
  loaded: false,
  saving: false,
  error: null,

  fetchPublic: async () => {
    try {
      const res = await systemSettingsService.getPublic();
      const partial = res?.data?.settings || res?.data || {};
      const prev = get().settings;
      const merged = {
        ...prev,
        branding: { ...prev.branding, ...partial.branding },
        themes: { ...prev.themes, ...partial.themes },
      };
      applySystemThemes(merged.themes);
      applyBrandingToDocument(merged.branding);
      set({ settings: merged, loaded: true, error: null });
    } catch (e) {
      console.warn('[SystemSettings] public load failed', e?.message);
    }
  },

  fetchSettings: async () => {
    try {
      const res = await systemSettingsService.get();
      const settings = res?.data?.settings || res?.data || empty;
      applySystemThemes(settings.themes);
      applyBrandingToDocument(settings.branding);
      set({ settings, loaded: true, error: null });
      return settings;
    } catch (e) {
      set({ error: e?.message || 'Failed to load settings' });
      throw e;
    }
  },

  applyFromPayload: (settings) => {
    if (!settings) return;
    applySystemThemes(settings.themes);
    applyBrandingToDocument(settings.branding);
    set({ settings, loaded: true });
  },

  saveSection: async (section, data) => {
    set({ saving: true });
    try {
      const res = await systemSettingsService.update({ [section]: data });
      const settings = res?.data?.settings || res?.data;
      get().applyFromPayload(settings);
      set({ saving: false });
      return settings;
    } catch (e) {
      set({ saving: false, error: e?.message });
      throw e;
    }
  },

  resetSection: async (section) => {
    set({ saving: true });
    try {
      const res = await systemSettingsService.resetSection(section);
      const settings = res?.data?.settings || res?.data;
      get().applyFromPayload(settings);
      set({ saving: false });
      return settings;
    } catch (e) {
      set({ saving: false });
      throw e;
    }
  },

  getNumbering: (id) => get().settings?.numbering?.[id],
  getPrint: (key) => get().settings?.print?.[key],
  getPanel: (key) => get().settings?.panels?.[key],
}));
