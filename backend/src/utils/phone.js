/** Normalize to last 10 digits for India mobile matching */
export function normalizePhone10(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}
