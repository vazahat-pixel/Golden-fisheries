import React, { useEffect, useState } from 'react';
import { useDriverStore } from '../../store/driverStore';
import { mapsService } from '../../services/mapsService';
import { Navigation, MapPin } from 'lucide-react';

const DriverLiveTracking = () => {
  const { myTrips, fetchMyTrips } = useDriverStore();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const active = myTrips?.find((t) =>
    ['STARTED', 'In Transit', 'ASSIGNED', 'ACCEPTED'].includes(t.status)
  );

  useEffect(() => {
    const id = active?._id || active?.id;
    if (!id) return;
    mapsService.getTripTrack(id).then((res) => setTrack(res?.data)).catch(() => {});
  }, [active?._id, active?.id]);

  if (!active) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">No active trip for tracking</div>
    );
  }

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <h1 className="text-lg font-black text-slate-900">Live Tracking</h1>
      <p className="text-xs text-slate-500">{active.tripNumber} — {active.status}</p>

      <div className="bg-white rounded-2xl border p-4 space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <MapPin size={14} /> From: {track?.pickupLocation || active.pickupLocation}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={14} className="text-blue-600" /> To: {track?.deliveryLocation || active.deliveryLocation}
        </p>
        {track?.lastLocation && (
          <p className="text-[10px] text-emerald-700 font-bold">
            Last ping: {track.lastLocation.latitude?.toFixed(5)}, {track.lastLocation.longitude?.toFixed(5)}
          </p>
        )}
      </div>

      {track?.navigationUrl && (
        <a
          href={track.navigationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase"
        >
          <Navigation size={16} /> Open in Google Maps
        </a>
      )}
    </div>
  );
};

export default DriverLiveTracking;
