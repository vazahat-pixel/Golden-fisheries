import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleNumber: '',
    type: 'Truck',
    capacity: '',
    fuelType: 'Diesel',
    status: 'AVAILABLE',
  });
  const [docs, setDocs] = useState({ rc: null, insurance: null, permit: null });
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadDoc = async (file, key) => {
    if (!file) return null;
    const res = await masterService.vehicles.uploadDocument(file);
    return res?.data?.url || res?.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const documentUrls = {};
      for (const key of ['rc', 'insurance', 'permit']) {
        if (docs[key]) {
          const url = await uploadDoc(docs[key], key);
          if (url) documentUrls[key] = { url, expiry: null, status: 'Valid' };
        }
      }
      const res = await masterService.vehicles.create({
        ...form,
        documents: documentUrls,
      });
      toast.success('Vehicle registered');
      navigate(`/admin/vehicles/${res?.vehicle?._id || res?._id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <form onSubmit={handleSubmit}>
        <PaperFormFrame title="Register vehicle" subtitle="RC · Insurance · Permit">
          <PaperFieldRow label="Vehicle number">
            <input className={paperInputClass} required value={form.vehicleNumber} onChange={(e) => setField('vehicleNumber', e.target.value.toUpperCase())} />
          </PaperFieldRow>
          <PaperFieldRow label="Type">
            <input className={paperInputClass} value={form.type} onChange={(e) => setField('type', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Capacity">
            <input className={paperInputClass} value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="RC document">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocs((d) => ({ ...d, rc: e.target.files[0] }))} />
          </PaperFieldRow>
          <PaperFieldRow label="Insurance">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocs((d) => ({ ...d, insurance: e.target.files[0] }))} />
          </PaperFieldRow>
          <PaperFieldRow label="Permit">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocs((d) => ({ ...d, permit: e.target.files[0] }))} />
          </PaperFieldRow>
          <button type="submit" disabled={loading} className="w-full mt-4 bg-[#6A7051] text-white py-3 font-bold uppercase text-sm">
            {loading ? 'Saving...' : 'Save vehicle'}
          </button>
        </PaperFormFrame>
      </form>
    </div>
  );
};

export default AddVehicle;
