import { logger } from '../utils/logger.js';
import { AppError } from '../utils/appError.js';
import { config } from '../config/config.js';

const coordsSchema = { lat: null, lng: null };

/**
 * Google Maps helpers — geocoding requires GOOGLE_MAPS_API_KEY.
 * Navigation / static map URLs work without server key (client opens Google Maps).
 */
class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || '';
    this.region = config.integrations.maps.region;
  }

  isGeocodeEnabled() {
    return Boolean(this.apiKey);
  }

  buildNavigationUrl({ origin, destination }) {
    const o = encodeURIComponent(origin || '');
    const d = encodeURIComponent(destination || '');
    return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`;
  }

  buildStaticMapUrl({ lat, lng, zoom = 14 }) {
    if (!this.apiKey || lat == null || lng == null) return null;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&markers=color:red%7C${lat},${lng}&key=${this.apiKey}`;
  }

  async geocodeAddress(address) {
    if (!address?.trim()) {
      throw new AppError('Address is required for geocoding', 400);
    }
    if (!this.isGeocodeEnabled()) {
      logger.warn('[Maps]: GOOGLE_MAPS_API_KEY not set — geocode skipped.');
      return { ...coordsSchema, formattedAddress: address, source: 'none' };
    }

    const q = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${this.apiKey}&region=${this.region}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      throw new AppError(`Geocoding failed: ${data.status || 'UNKNOWN'}`, 400);
    }

    const loc = data.results[0].geometry.location;
    return {
      lat: loc.lat,
      lng: loc.lng,
      formattedAddress: data.results[0].formatted_address,
      source: 'google'
    };
  }

  async resolveRoutePoints(pickupAddress, deliveryAddress) {
    const [pickup, delivery] = await Promise.all([
      this.geocodeAddress(pickupAddress),
      this.geocodeAddress(deliveryAddress)
    ]);
    return {
      pickup,
      delivery,
      navigationUrl: this.buildNavigationUrl({
        origin: pickup.formattedAddress || pickupAddress,
        destination: delivery.formattedAddress || deliveryAddress
      })
    };
  }

  haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const mapsService = new MapsService();
export default mapsService;
