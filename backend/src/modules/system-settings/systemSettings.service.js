import { SystemSettings } from './systemSettings.model.js';
import {
  DEFAULT_SYSTEM_SETTINGS,
  SETTINGS_SINGLETON_ID,
  SEQUENCE_KEY_ALIASES,
} from './defaultSettings.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { logger } from '../../utils/logger.js';

let cache = null;
let cacheAt = 0;
const CACHE_MS = 2000;

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const out = { ...target };
  for (const k of Object.keys(source)) {
    if (
      source[k] &&
      typeof source[k] === 'object' &&
      !Array.isArray(source[k]) &&
      target[k] &&
      typeof target[k] === 'object' &&
      !Array.isArray(target[k])
    ) {
      out[k] = deepMerge(target[k], source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

function mergeWithDefaults(doc) {
  const plain = doc?.toObject?.() || doc || {};
  return {
    branding: deepMerge(DEFAULT_SYSTEM_SETTINGS.branding, plain.branding || {}),
    numbering: deepMerge(DEFAULT_SYSTEM_SETTINGS.numbering, plain.numbering || {}),
    themes: deepMerge(DEFAULT_SYSTEM_SETTINGS.themes, plain.themes || {}),
    print: deepMerge(DEFAULT_SYSTEM_SETTINGS.print, plain.print || {}),
    panels: deepMerge(DEFAULT_SYSTEM_SETTINGS.panels, plain.panels || {}),
    updatedAt: plain.updatedAt,
    createdAt: plain.createdAt,
  };
}

export async function ensureSystemSettings() {
  let doc = await SystemSettings.findOne({ singleton: SETTINGS_SINGLETON_ID });
  if (!doc) {
    doc = await SystemSettings.create({
      singleton: SETTINGS_SINGLETON_ID,
      ...DEFAULT_SYSTEM_SETTINGS,
    });
    logger.info('[SystemSettings] Created default global configuration.');
  }
  return mergeWithDefaults(doc);
}

export async function getSystemSettings({ bypassCache = false } = {}) {
  const now = Date.now();
  if (!bypassCache && cache && now - cacheAt < CACHE_MS) {
    return cache;
  }
  const doc = await SystemSettings.findOne({ singleton: SETTINGS_SINGLETON_ID });
  if (!doc) {
    const seeded = await ensureSystemSettings();
    cache = seeded;
    cacheAt = now;
    return seeded;
  }
  const merged = mergeWithDefaults(doc);
  cache = merged;
  cacheAt = now;
  return merged;
}

export function invalidateSettingsCache() {
  cache = null;
  cacheAt = 0;
}

export async function getNumberingConfig(sequenceKey) {
  const settings = await getSystemSettings();
  const alias = SEQUENCE_KEY_ALIASES[sequenceKey] || sequenceKey;
  const cfg = settings.numbering?.[alias];
  if (cfg?.prefix) {
    return {
      key: cfg.key || sequenceKey,
      prefix: String(cfg.prefix).toUpperCase().replace(/-+$/, ''),
      pad: Math.min(8, Math.max(2, Number(cfg.pad) || 4)),
    };
  }
  const fallback = DEFAULT_SYSTEM_SETTINGS.numbering[alias];
  if (fallback) {
    return { key: fallback.key, prefix: fallback.prefix, pad: fallback.pad };
  }
  return { key: sequenceKey, prefix: String(sequenceKey).toUpperCase().slice(0, 3), pad: 4 };
}

export async function updateSystemSettings(partial, userId) {
  const allowed = ['branding', 'numbering', 'themes', 'print', 'panels'];
  const $set = { updatedBy: userId || null };
  for (const section of allowed) {
    if (partial[section] !== undefined) {
      $set[section] = partial[section];
    }
  }

  const doc = await SystemSettings.findOneAndUpdate(
    { singleton: SETTINGS_SINGLETON_ID },
    { $set },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  invalidateSettingsCache();
  const merged = mergeWithDefaults(doc);
  cache = merged;
  cacheAt = Date.now();

  broadcastEvent('settings:updated', { settings: merged, at: new Date().toISOString() });

  return merged;
}

export async function resetSystemSettingsSection(section, userId) {
  if (!DEFAULT_SYSTEM_SETTINGS[section]) {
    throw new Error(`Unknown settings section: ${section}`);
  }
  return updateSystemSettings({ [section]: DEFAULT_SYSTEM_SETTINGS[section] }, userId);
}
