import React, { useEffect } from 'react';
import { useDriverStore } from '../../store/driverStore';

const DriverExpenses = () => {
  const { myExpenses, fetchMyExpenses, loading } = useDriverStore();

  useEffect(() => {
    fetchMyExpenses();
  }, [fetchMyExpenses]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-black uppercase tracking-wide">Trip expenses</h1>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : myExpenses.length === 0 ? (
        <p className="text-sm text-gray-500">No expenses recorded</p>
      ) : (
        <ul className="space-y-2">
          {myExpenses.map((e) => (
            <li key={e._id || e.id} className="bg-white border rounded-lg p-3 text-sm">
              <p className="font-bold">{e.category || e.type || 'Expense'}</p>
              <p>₹{(e.amount || 0).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-500">{e.status || ''}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverExpenses;
