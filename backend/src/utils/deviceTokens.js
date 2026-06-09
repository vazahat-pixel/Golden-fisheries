/** FCM device token helpers — supports legacy string[] and { token, platform } entries. */

export const DEVICE_PLATFORMS = {
  WEB: 'web',
  APP: 'app',
};

export const DEVICE_PLATFORM_LIST = Object.values(DEVICE_PLATFORMS);

export function normalizeDevicePlatform(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === DEVICE_PLATFORMS.APP || raw === 'mobile') return DEVICE_PLATFORMS.APP;
  if (raw === DEVICE_PLATFORMS.WEB) return DEVICE_PLATFORMS.WEB;
  return null;
}

export function parseDeviceTokenEntry(entry) {
  if (typeof entry === 'string') {
    return { token: entry, platform: DEVICE_PLATFORMS.WEB };
  }
  if (entry && typeof entry === 'object' && entry.token) {
    return {
      token: entry.token,
      platform: normalizeDevicePlatform(entry.platform) || DEVICE_PLATFORMS.WEB,
    };
  }
  return null;
}

export function extractDeviceTokenStrings(deviceTokens = []) {
  return [...new Set(
    deviceTokens
      .map(parseDeviceTokenEntry)
      .filter(Boolean)
      .map((entry) => entry.token)
  )];
}

export function upsertDeviceToken(deviceTokens = [], token, platform = DEVICE_PLATFORMS.WEB) {
  const normalized = deviceTokens
    .map(parseDeviceTokenEntry)
    .filter(Boolean)
    .filter((entry) => entry.token !== token);

  normalized.push({
    token,
    platform: normalizeDevicePlatform(platform) || DEVICE_PLATFORMS.WEB,
    registeredAt: new Date(),
  });

  return normalized;
}

export function removeDeviceToken(deviceTokens = [], token) {
  return deviceTokens
    .map(parseDeviceTokenEntry)
    .filter(Boolean)
    .filter((entry) => entry.token !== token);
}

export async function pullFailedDeviceTokens(User, failedTokens = []) {
  if (!failedTokens.length) return;

  await User.updateMany(
    { deviceTokens: { $in: failedTokens } },
    { $pull: { deviceTokens: { $in: failedTokens } } }
  );

  for (const failed of failedTokens) {
    await User.updateMany(
      { 'deviceTokens.token': failed },
      { $pull: { deviceTokens: { token: failed } } }
    );
  }
}
