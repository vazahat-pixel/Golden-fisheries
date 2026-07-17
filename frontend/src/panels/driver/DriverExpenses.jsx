import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { FieldPageWrap, FieldInlineLoader } from '../../design-system/field-app';
import { Plus } from 'lucide-react';

const DriverExpenses = () => {
  const navigate = useNavigate();
  const { myExpenses, fetchMyExpenses, loading } = useDriverStore();

  useEffect(() => {
    fetchMyExpenses();
  }, [fetchMyExpenses]);

  return (
    <FieldPageWrap subtitle="Claims & reimbursements">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="fa-page-title">Expenses</h1>
          <p className="fa-page-subtitle">Track claims & reimbursements</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/driver/expenses/new')}
          className="fa-btn-primary !w-auto px-4 py-2.5 flex items-center gap-1.5 text-[10px] shrink-0"
        >
          <Plus size={14} strokeWidth={2.5} /> Add
        </button>
      </div>
      {loading ? (
        <FieldInlineLoader label="Loading expenses" />
      ) : myExpenses.length === 0 ? (
        <div className="fa-empty-state py-12">
          <p className="text-sm fa-muted">No expenses recorded</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {myExpenses.map((e) => (
            <li key={e._id || e.id} className="fa-list-row !cursor-default">
              <div className="fa-list-avatar">₹</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{e.category || e.expenseType || e.type || 'Expense'}</p>
                <p className="text-[11px] fa-muted mt-0.5 uppercase tracking-wide font-medium">{e.status || 'Pending'}</p>
              </div>
              <p className="fa-amount-positive text-base font-extrabold shrink-0">
                ₹{(e.amount || 0).toLocaleString('en-IN')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FieldPageWrap>
  );
};

export default DriverExpenses;
