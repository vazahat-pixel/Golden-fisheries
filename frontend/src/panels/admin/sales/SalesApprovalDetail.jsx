import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buyerPortalService } from '../../../services/buyerPortalService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const SalesApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);

  useEffect(() => {
    buyerPortalService
      .adminListReturns({ limit: 200 })
      .then((res) => {
        const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
        setRow(list.find((x) => x._id === id));
      })
      .catch(() => toast.error('Not found'));
  }, [id]);

  const approve = async () => {
    try {
      await buyerPortalService.approveReturn(id);
      toast.success('Approved');
      navigate('/admin/sales-approval');
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  if (!row) return <p className="p-6 text-sm">Loading...</p>;

  return (
    <div className="pb-12 max-w-xl">
      <AdminPageHeader title={row.returnNo} subtitle="Sales return detail" />
      <AdminCard className="p-4 space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Tapal:</span> {row.tapalRef}
        </p>
        <p>
          <span className="text-gray-500">Returned:</span> {row.returnedQty} KG (damaged {row.damagedQty || 0})
        </p>
        <p>
          <span className="text-gray-500">Amount:</span> ₹{row.returnAmount?.toLocaleString('en-IN')}
        </p>
        <p>
          <span className="text-gray-500">Adjustment:</span> ₹{row.adjustmentAmount || 0}
        </p>
        <p>
          <span className="text-gray-500">Remarks:</span> {row.remarks || '—'}
        </p>
        <p>
          <span className="text-gray-500">Inventory impact:</span>{' '}
          {row.inventoryImpact?.applied ? 'Applied' : 'Pending approval'}
        </p>
        <p>
          <span className="text-gray-500">Settlement:</span> {row.settlementImpact?.status || 'PENDING'}
        </p>
        {row.status === 'PENDING' && (
          <button
            type="button"
            onClick={approve}
            className="mt-4 w-full py-3 bg-emerald-600 text-white rounded font-bold text-xs uppercase"
          >
            Approve return
          </button>
        )}
      </AdminCard>
    </div>
  );
};

export default SalesApprovalDetail;
