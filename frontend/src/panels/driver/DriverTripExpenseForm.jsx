import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../services/tapalService';
import { PaperFormFrame } from '../../components/forms/PaperFormFrame';
import { TripExpenseFields } from './TripExpenseFields';
import { useTripExpenseForm } from './useTripExpenseForm';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

/** Standalone end-trip sheet (deep link / review after submit). */
const DriverTripExpenseForm = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const { form, setForm, set, totalExpenses, balancePayable, buildPayload } = useTripExpenseForm(trip);

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const res = await tapalService.getTripById(tripId);
        const t = res?.data?.trip || res?.trip || res;
        setTrip(t);
      } catch {
        toast.error('Could not load trip');
      }
    })();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tapalService.submitPostTripExpense(tripId, buildPayload());
      toast.success('End trip sheet submitted');
      navigate(`/driver/trip-expense/${tripId}/bill`);
    } catch (err) {
      toast.error(err?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <button type="button" onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <form onSubmit={handleSubmit}>
        <PaperFormFrame title="Driver End Trip Sheet" subtitle="Trip accounting">
          <TripExpenseFields
            variant="paper"
            form={form}
            setForm={setForm}
            set={set}
            totalExpenses={totalExpenses}
            balancePayable={balancePayable}
          />
        </PaperFormFrame>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-[#6A7051] text-white py-4 font-bold uppercase text-sm"
        >
          {loading ? 'Submitting...' : 'Submit End Trip Sheet'}
        </button>
      </form>
    </div>
  );
};

export default DriverTripExpenseForm;
