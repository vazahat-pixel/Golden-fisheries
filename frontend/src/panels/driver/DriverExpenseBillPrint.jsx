import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../services/tapalService';
import { PrintActions } from '../../components/print/PrintActions';
import { toast } from 'react-hot-toast';

/**
 * Printable Driver End Trip sheet — matches client paperwork layout.
 */
const DriverExpenseBillPrint = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    tapalService
      .getTripById(tripId)
      .then((res) => setTrip(res?.data?.trip || res?.trip || res))
      .catch(() => toast.error('Trip not found'));
  }, [tripId]);

  if (!trip) {
    return <p className="p-6 text-sm">Loading trip sheet...</p>;
  }

  const pte = trip.postTripExpenses || {};
  const tapal = trip.tapalId || trip.tapal || {};
  const pumps = pte.pumps || [];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <PrintActions onBack={() => navigate(-1)} title="Driver End Trip Sheet" />
      <div
        className="print-root max-w-[210mm] mx-auto border-2 border-black p-[10mm] text-sm"
        style={{ background: '#ffffff', color: '#000000' }}
      >
        <div className="text-center border-b-2 border-black pb-2 mb-3">
          <h1 className="text-base font-bold uppercase tracking-widest">Golden Fisheries</h1>
          <p className="text-xs uppercase">Driver End Trip / Expense Sheet</p>
        </div>

        <table className="w-full text-xs mb-3">
          <tbody>
            <tr>
              <td className="font-bold w-32 py-1">Trip No</td>
              <td>{trip.tripNumber || trip.tripNo}</td>
              <td className="font-bold w-32 py-1">Tapal No</td>
              <td>{pte.tapalNo || tapal.tapalNumber || tapal.tpNo}</td>
            </tr>
            <tr>
              <td className="font-bold py-1">Vehicle</td>
              <td>{pte.vehicleNumber || trip.vehicleId?.vehicleNumber || '—'}</td>
              <td className="font-bold py-1">Driver</td>
              <td>{pte.driverName || '—'}</td>
            </tr>
            <tr>
              <td className="font-bold py-1">Loading</td>
              <td colSpan={3}>{pte.loadingPoint || trip.pickupLocation}</td>
            </tr>
            <tr>
              <td className="font-bold py-1">Unloading</td>
              <td colSpan={3}>{pte.unloadingPoint || trip.deliveryLocation}</td>
            </tr>
          </tbody>
        </table>

        <table className="print-table mb-3">
          <thead>
            <tr>
              <th>KM / Mileage</th>
              <th>Start</th>
              <th>End</th>
              <th>Total KM</th>
              <th>Mileage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>{pte.startingKms ?? '—'}</td>
              <td>{pte.endingKms ?? '—'}</td>
              <td>{pte.totalKms ?? '—'}</td>
              <td>{pte.mileage ?? '—'}</td>
            </tr>
          </tbody>
        </table>

        <table className="print-table mb-3">
          <thead>
            <tr>
              <th>Expense Head</th>
              <th className="text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Diesel', pte.diesel],
              ['Toll / FASTag', pte.tollFastag],
              ['RTO / PC / RMC', pte.rtoPcRmc],
              ['Maintenance', pte.maintenance],
              ['Driver Batta', pte.driverBatta],
              ['Halting', pte.halting],
            ].map(([label, val]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-right font-mono">{(val ?? 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pumps.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase mb-1">Pump Entries</p>
            <table className="print-table mb-3">
              <thead>
                <tr>
                  <th>Pump</th>
                  <th>Litres</th>
                  <th className="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {pumps.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.litres}</td>
                    <td className="text-right font-mono">{(p.amount ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="border-2 border-black p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="font-bold">Total Expenses</span>
            <span className="font-mono">₹{(pte.totalExpenses ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Less Advance</span>
            <span className="font-mono">₹{(pte.lessAdvance ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-2 font-bold text-base">
            <span>Balance Payable</span>
            <span className="font-mono">₹{(pte.balancePayable ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {pte.remarks && (
          <p className="text-xs mt-3">
            <span className="font-bold">Remarks:</span> {pte.remarks}
          </p>
        )}

        <div className="grid grid-cols-2 gap-8 mt-10 text-xs">
          <div className="border-t border-black pt-2 text-center">Driver Signature</div>
          <div className="border-t border-black pt-2 text-center">Office Approval</div>
        </div>
      </div>
    </div>
  );
};

export default DriverExpenseBillPrint;
