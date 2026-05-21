import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerPortalService } from '../../../services/buyerPortalService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const SalesApprovalList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await buyerPortalService.adminListReturns({ status: 'PENDING' });
      const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
      setReturns(list);
    } catch (e) {
      toast.error(e?.message || 'Failed to load returns');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await buyerPortalService.approveReturn(id);
      toast.success('Return approved — inventory restored');
      load();
    } catch (e) {
      toast.error(e?.message || 'Approval failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader title="Sales return approval" subtitle="Buyer returns pending settlement" badge="Returns" />
      {loading ? (
        <p className="text-sm">Loading...</p>
      ) : returns.length === 0 ? (
        <AdminCard className="p-6 text-sm text-gray-500">No pending returns</AdminCard>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <AdminCard key={r._id} className="p-4 flex flex-wrap justify-between gap-4 items-center">
              <div>
                <p className="font-black text-sm">{r.returnNo}</p>
                <p className="text-[10px] text-gray-500">
                  Tapal {r.tapalRef || '—'} · Qty {r.returnedQty} KG · ₹{r.returnAmount?.toLocaleString('en-IN')}
                </p>
                {r.remarks && <p className="text-xs mt-1">{r.remarks}</p>}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/sales-approval/${r._id}`}
                  className="px-3 py-2 border rounded text-[10px] font-bold uppercase"
                >
                  Detail
                </Link>
                <button
                  type="button"
                  onClick={() => approve(r._id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase"
                >
                  Approve
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesApprovalList;
