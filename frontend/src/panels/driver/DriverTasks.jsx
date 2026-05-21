import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';

const DriverTasks = () => {
  const navigate = useNavigate();
  const { activeTrip, fetchMyTrips } = useDriverStore();

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  useEffect(() => {
    if (activeTrip) navigate('/driver/active-trip', { replace: true });
  }, [activeTrip, navigate]);

  return (
    <div className="p-4">
      <h1 className="text-lg font-black uppercase mb-2">My trips</h1>
      <p className="text-sm text-gray-600 mb-4">No active assignment. Check history or wait for dispatch.</p>
      <button
        type="button"
        onClick={() => navigate('/driver/history')}
        className="w-full py-3 bg-[#6A7051] text-white font-bold text-xs uppercase"
      >
        Trip history
      </button>
    </div>
  );
};

export default DriverTasks;
