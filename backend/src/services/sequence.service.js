import { Sequence } from '../models/sequence.model.js';
import { getNumberingConfig } from '../modules/system-settings/systemSettings.service.js';

/**
 * Returns next monotonic number for a logical series key (global, not per-day,
 * to stay compatible with existing HSL-0001 / PUR-0001 style slips).
 */
export async function nextSequence(key) {
  const doc = await Sequence.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.seq;
}

/**
 * @param {string} key - stable counter key, e.g. 'harvest', 'tapal-purchase'
 * @param {string} prefix - printed prefix without trailing separator, e.g. 'HSL'
 * @param {number} pad - zero pad width
 */
export async function formatSequentialDocNo(key, prefix, pad = 4) {
  const cfg = await getNumberingConfig(key);
  const seqKey = cfg.key || key;
  const pref = cfg.prefix || prefix;
  const padding = cfg.pad ?? pad;
  const n = await nextSequence(seqKey);
  return `${pref}-${String(n).padStart(padding, '0')}`;
}
