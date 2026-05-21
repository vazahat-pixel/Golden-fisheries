import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    masterService.vehicles
      .getById(id)
      .then((v) => setVehicle(v?.vehicle || v))
      .catch(() => toast.error('Vehicle not found'));
  }, [id]);

  if (!vehicle) return <p className="p-8 text-sm">Loading...</p>;

  const docs = vehicle.documents || {};
  const expiring = ['rc', 'insurance', 'permit', 'fitness', 'pollution'].filter((k) => {
    const ex = docs[k]?.expiry;
    if (!ex) return false;
    const days = (new Date(ex) - new Date()) / 86400000;
    return days >= 0 && days < 30;
  });

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <button type="button" onClick={() => navigate('/admin/vehicles')} className="mb-4 flex items-center gap-1 text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <PaperFormFrame title={vehicle.vehicleNumber} subtitle="Vehicle documents & status">
        <PaperFieldRow label="Type">
          <input className={paperInputClass} readOnly value={vehicle.type || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Status">
          <input className={paperInputClass} readOnly value={vehicle.status || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Driver">
          <input className={paperInputClass} readOnly value={vehicle.assignedDriverName || '—'} />
        </PaperFieldRow>
        {expiring.length > 0 && (
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase my-2">
            <AlertTriangle size={16} /> Expiry alert: {expiring.join(', ')}
          </div>
        )}
        {['rc', 'insurance', 'permit', 'fitness', 'pollution'].map((key) => (
          <PaperFieldRow key={key} label={key.toUpperCase()}>
            {docs[key]?.url ? (
              <a href={docs[key].url} target="_blank" rel="noreferrer" className="text-sm underline text-blue-700">
                View document
                {docs[key].expiry ? ` (exp: ${new Date(docs[key].expiry).toLocaleDateString()})` : ''}
              </a>
            ) : (
              <span className="text-xs text-gray-500">Not uploaded</span>
            )}
          </PaperFieldRow>
        ))}
      </PaperFormFrame>
    </div>
  );
};

export default VehicleDetail;
