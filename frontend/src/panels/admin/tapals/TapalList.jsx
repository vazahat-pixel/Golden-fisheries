import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tapalService } from '../../../services/tapalService';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TapalList = () => {
  const navigate = useNavigate();
  const [tapals, setTapals] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await tapalService.all();
      const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
      setTapals(list);
    } catch (err) {
      toast.error(err?.message || 'Failed to load tapals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-card-border pb-4">
        <h1 className="text-xl font-bold uppercase text-brand-olive">Tapal Register</h1>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="p-2 border border-card-border rounded">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/procurement/tapal/create')}
            className="flex items-center gap-1 bg-brand-olive text-white px-3 py-2 text-xs font-bold uppercase"
          >
            <Plus size={16} /> From Harvest
          </button>
        </div>
      </div>

      <div className="border border-black bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="p-2 text-left">TP No</th>
              <th className="p-2 text-left">Party</th>
              <th className="p-2 text-left">Destination</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {tapals.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No tapals. Create from harvest after purchase invoice.
                </td>
              </tr>
            )}
            {tapals.map((t) => (
              <tr
                key={t._id || t.id}
                className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/tapals/${t._id || t.id}`)}
              >
                <td className="p-2 font-mono">{t.tpNo || t.tapalNumber}</td>
                <td className="p-2">{t.partyName}</td>
                <td className="p-2">{t.destination || t.unloadingPoint}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.vehicleNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TapalList;
