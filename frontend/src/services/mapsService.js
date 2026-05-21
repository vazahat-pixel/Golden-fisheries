import { apiClient } from './apiClient';

export const mapsService = {
  geocode: (address) => apiClient.get('/maps/geocode', { params: { address } }),

  getTripTrack: (tripId) => apiClient.get(`/maps/trip/${tripId}/track`),

  postDriverLocation: (tripId, latitude, longitude, accuracy) =>
    apiClient.post(`/maps/trip/${tripId}/location`, { latitude, longitude, accuracy })
};

export default mapsService;
