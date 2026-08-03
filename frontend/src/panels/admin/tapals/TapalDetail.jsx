import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../../services/tapalService';
import { buyerPortalService } from '../../../services/buyerPortalService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import AssignDriverPanel from '../shared/AssignDriverPanel';
import { TripSettlementPaymentForm } from '../shared/TripSettlementPayment';
import { useAdminStore } from '../../../store/adminStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TapalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tapal, setTapal] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { confirmTripPaymentAsync } = useAdminStore();
  const [paying, setPaying] = useState(false);
  const [buyerSale, setBuyerSale] = useState(null);

  const loadTapal = useCallback(() => {
    tapalService
      .getById(id)
      .then((res) => setTapal(res?.data?.tapal || res?.tapal || res))
      .catch(() => toast.error('Failed to load tapal'));
  }, [id]);

  const loadTrip = useCallback((tapalId) => {
    setLoadingTrip(true);
    tapalService
      .getTripById(tapalId)
      .then((res) => {
        setTrip(res?.data?.trip || res?.trip || res);
      })
      .catch((err) => {
        console.warn('Trip details not found for tapal:', tapalId, err);
      })
      .finally(() => setLoadingTrip(false));
  }, []);

  useEffect(() => {
    loadTapal();
  }, [loadTapal]);

  useEffect(() => {
    if (tapal?._id) {
      loadTrip(tapal._id);
      buyerPortalService
        .adminSaleByTapal(tapal._id)
        .then((res) => setBuyerSale(res?.data || res))
        .catch(() => setBuyerSale(null));
    }
  }, [tapal?._id, loadTrip]);

  const handleReview = async (status) => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Please specify a reason for rejection');
      return;
    }
    setReviewing(true);
    try {
      await tapalService.reviewPostTripExpense(trip._id || trip.id, status, rejectionReason);
      toast.success(`Trip settlement ${status.toLowerCase()} successfully`);
      if (tapal?._id) {
        loadTrip(tapal._id);
      }
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (err) {
      toast.error(err?.message || 'Review action failed');
    } finally {
      setReviewing(false);
    }
  };

  const handleConfirmPayment = async (amount, upiId) => {
    setPaying(true);
    try {
      await confirmTripPaymentAsync(trip._id || trip.id, amount, upiId, 'UPI');
      toast.success('Payment recorded — trip marked complete');
      if (tapal?._id) loadTrip(tapal._id);
    } catch (err) {
      toast.error(err?.message || 'Payment failed');
      throw err;
    } finally {
      setPaying(false);
    }
  };

  if (!tapal) return <p className="p-8 text-sm">Loading...</p>;

  const lines = tapal.products || [];
  const postTrip = trip?.postTripExpenses;

  const computedTotalBoxes = lines.reduce(
    (sum, item) => sum + (parseInt(item.noOfBoxes ?? item.boxes ?? item.boxQty, 10) || 0),
    0
  );
  const computedTotalCount = lines.reduce(
    (sum, item) => sum + (parseInt(item.count, 10) || 0),
    0
  );
  const computedTotalBoxWeight = lines.reduce(
    (sum, item) => sum + (parseFloat(item.boxWeight ?? item.weightPerBox) || 0),
    0
  );

  // Pre-fill item rows for grid visualization (standard 12 row notepad pad replica)
  const displayItems = [...lines];
  const minRows = 12;
  while (displayItems.length < minRows) {
    displayItems.push({
      id: `empty-${displayItems.length}`,
      hsnCode: '',
      particulars: '',
      count: '',
      noOfBoxes: '',
      boxWeight: '',
      totalWeight: '',
      rate: '',
      totalAmount: ''
    });
  }

  const harvest = tapal.harvest || tapal.harvestId || {};
  const tds = tapal.tds ?? harvest.tds ?? 0;
  const commission = tapal.commission ?? harvest.commission ?? 0;
  const soft = tapal.soft ?? harvest.soft ?? 0;
  const grandTotal = tapal.grandTotal ?? harvest.totalPayableAmount ?? harvest.grandTotal ?? tapal.numericAmount ?? 0;

  const notes = tapal.notes || harvest.remarks || harvest.notes || '';
  const damageNotes = tapal.damageNotes || harvest.damageComplaint || harvest.damageNotes || '';
  const rawDeductionsNotes = tapal.deductionsNotes ?? harvest.deductionsNotes ?? '';
  const deductionsNotes = !rawDeductionsNotes || /NOT\s+DEDUCTED/i.test(rawDeductionsNotes) ? '' : rawDeductionsNotes;

  const inWords = tapal.inWords || (tapal.numericQty ? `${tapal.numericQty} KILOGRAMS ONLY` : `${tapal.totalWeight || tapal.qty || 0} KILOGRAMS ONLY`);

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-between items-center">
        <button type="button" onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/tapals/${tapal._id || tapal.id}/preview`)}
          className="flex items-center gap-1 text-xs font-bold uppercase border px-3 py-2 bg-white hover:bg-slate-50 transition-all text-text-secondary"
        >
          <Printer size={14} /> Print Tapal
        </button>
      </div>
      <div className="no-print mb-6">
        <AssignDriverPanel tapal={tapal} onAssigned={loadTapal} />
      </div>

      <div className="print-root flex justify-center items-center py-4 bg-slate-100/50">
        <div 
          className="w-[210mm] bg-white pt-[5mm] px-[5mm] shadow-xl border border-black/10 font-arial text-black"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* Main Border */}
          <div className="border border-black flex flex-col justify-between">
            <div>
              {/* Header Box */}
              <div className="text-center pb-1 border-b border-black">
                <h1 className="text-2xl font-bold tracking-wide text-[#1e3a8a] mt-1 mb-0 pb-0">
                  M. K. FISHERIES
                </h1>
                <h2 className="text-sm font-bold text-[#1e3a8a] mt-0">
                  WHOLE SALE FISH MERCHANTS
                </h2>
                <p className="text-xs font-semibold text-[#1e3a8a] mt-0">
                  KARWAR & MANGALORE (KARNATAKA)
                </p>
                <p className="text-[10px] font-semibold text-[#1e3a8a] mt-0 mb-1">
                  Mob : 9019411439, 9663655558
                </p>
                <div className="border-t border-black w-full text-center py-1">
                   <h3 className="text-sm font-bold text-[#1e3a8a] tracking-wide">★ TAPAL / LOGISTICS DISPATCH ★</h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex border-b border-black text-[11px] leading-tight font-medium text-black h-[110px]">
                {/* Left Side Details */}
                <div className="w-1/2 border-r border-black flex flex-col">
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-bold pl-1 w-full">Customer Details :</span>
                  </div>
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">NAME</span>
                    <span className="pl-1 w-full uppercase">{tapal.partyName || tapal.party || tapal.buyerName || 'UNASSIGNED BUYER'}</span>
                  </div>
                  <div className="flex border-b border-black h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">CITY</span>
                    <span className="pl-1 w-full uppercase">{tapal.destination || 'N/A'}</span>
                  </div>
                  <div className="flex h-1/4 items-center">
                    <span className="font-semibold pl-1 w-24 uppercase">MOB NUMBER</span>
                    <span className="pl-1 w-full">{tapal.buyerPhone || tapal.consigneeContact || ''}</span>
                  </div>
                </div>

                {/* Right Side Details */}
                <div className="w-1/2 flex flex-col">
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      TP NO :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold">{tapal.tpNo || tapal.tapalNumber || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Date :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold">
                      {tapal.createdAt ? new Date(tapal.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Vehicle No :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{tapal.vehicleNo || tapal.vehicleNumber || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-black h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Driver Name :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{tapal.driver || tapal.driverName || 'N/A'}</div>
                  </div>
                  <div className="flex h-1/5 items-center">
                    <div className="w-1/3 border-r border-black flex items-center h-full justify-end pr-1 font-bold">
                      Grader Name :
                    </div>
                    <div className="w-2/3 pl-1 font-semibold uppercase">{tapal.graderName || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="w-full">
                <table className="w-full text-center border-collapse text-[11px] font-semibold text-black">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-1 px-1 border-r border-black w-[40px]">Sl No</th>
                      <th className="py-1 px-1 border-r border-black w-[70px]">Hsn Code</th>
                      <th className="py-1 px-1 border-r border-black text-left pl-1">Particulars</th>
                      <th className="py-1 px-1 border-r border-black w-[50px]">Count</th>
                      <th className="py-1 px-1 border-r border-black w-[60px] leading-tight">NO OF<br/>BOXES</th>
                      <th className="py-1 px-1 w-[70px]">Box Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, index) => {
                      return (
                        <tr key={item.id || index} className="border-b border-black h-[22px]">
                          <td className="border-r border-black">
                            {index + 1}
                          </td>
                          <td className="border-r border-black font-mono text-[10px]">
                            {item.hsnCode || item.hsn || ''}
                          </td>
                          <td className="border-r border-black text-left pl-1">
                            {item.particulars || item.name || ''}
                          </td>
                          <td className="border-r border-black">
                            {item.count || ''}
                          </td>
                          <td className="border-r border-black">
                            {item.noOfBoxes || item.boxes || item.boxQty || ''}
                          </td>
                          <td>
                            {item.boxWeight || item.weightPerBox ? `${item.boxWeight || item.weightPerBox}` : ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals Row */}
                    <tr className="border-b border-black font-bold h-[22px]">
                      <td colSpan="3" className="border-r border-black"></td>
                      <td className="border-r border-black text-center">{computedTotalCount > 0 ? computedTotalCount : ''}</td>
                      <td className="border-r border-black text-center">{tapal.totalBoxes || tapal.totalNoOfBoxes || computedTotalBoxes || '0'}</td>
                      <td className="text-center">{computedTotalBoxWeight > 0 ? parseFloat(computedTotalBoxWeight.toFixed(2)) : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Signatures Footer Block */}
            <div className="w-full flex flex-col text-[10px] font-bold text-black border-t border-black">
              
              {/* Notes Row 1 */}
              <div className="flex border-b border-black h-[22px]">
                <div className="w-full border-black bg-[#FDF9EA] flex items-center justify-center">
                  {notes || ''}
                </div>
              </div>

              {/* Notes Row 2 */}
              <div className="flex border-b border-black h-[22px]">
                <div className="w-full flex items-center justify-center text-red-600">
                  {deductionsNotes}
                </div>
              </div>

              {/* Bottom text instructions */}
              <div className="flex h-[26px] border-b border-black">
                <div className="w-[80px] border-r border-black flex items-center justify-center font-bold text-[11px]">
                  (in words)
                </div>
                <div className="flex-1 flex items-center pl-2 font-bold text-[11px] uppercase">
                   {inWords}
                </div>
              </div>

              {/* Signature layout */}
              <div className="flex w-full mt-1 min-h-[90px]">
                <div className="w-2/3 border-r border-black p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Receiver Sign & Stamp:</span>
                  <div className="w-32 border-b border-black/30 border-dashed mb-1"></div>
                </div>
                <div className="w-1/3 flex flex-col justify-between pt-1 pb-2">
                  <div className="text-[10px] pl-2">
                     For : M.K. FISHERIES
                  </div>
                  <div className="text-[10px] pl-2 flex justify-center mt-12 w-full">
                     Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print mt-6">
        <PaperFormFrame title="Buyer sale" subtitle="Verification, bill & payment from buyer portal">
          {!buyerSale?.verification && !buyerSale?.bill ? (
            <p className="text-xs text-gray-500 italic">
              Buyer ne abhi verify ya bill nahi kiya. Status: {tapal.status}
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {buyerSale.verification && (
                <div className="border border-gray-200 p-3 bg-gray-50">
                  <p className="text-[10px] font-black uppercase text-brand-olive mb-2">Verification</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block">Dispatched</span>
                      {buyerSale.verification.dispatchedQty?.weight ?? 0} KG ·{' '}
                      {buyerSale.verification.dispatchedQty?.noOfBoxes ?? 0} boxes
                    </div>
                    <div>
                      <span className="text-gray-500 block">Received</span>
                      {buyerSale.verification.receivedQty?.weight ?? 0} KG ·{' '}
                      {buyerSale.verification.receivedQty?.noOfBoxes ?? 0} boxes
                    </div>
                  </div>
                  <p className="text-[10px] mt-2 font-bold uppercase">
                    {buyerSale.verification.verificationStatus}
                    {buyerSale.verification.discrepancy?.hasDiscrepancy ? ' · Mismatch' : ''}
                  </p>
                </div>
              )}
              {buyerSale.bill ? (
                <div className="border border-emerald-200 p-3 bg-emerald-50/50">
                  <p className="text-[10px] font-black uppercase text-emerald-800 mb-2">Buyer bill</p>
                  <p className="font-mono font-bold">{buyerSale.bill.billNo}</p>
                  <p className="text-xs mt-1">
                    {buyerSale.bill.finalWeight} KG @ ₹{buyerSale.bill.ratePerKg} ={' '}
                    <strong>₹{(buyerSale.bill.totalAmount || 0).toLocaleString('en-IN')}</strong>
                  </p>
                  <p className="text-[10px] font-bold uppercase mt-2">
                    Bill: {buyerSale.bill.status}
                    {buyerSale.bill.status === 'PAID' &&
                      ` · Paid ₹${(buyerSale.bill.paidAmount ?? buyerSale.bill.totalAmount)?.toLocaleString('en-IN')}`}
                  </p>
                </div>
              ) : buyerSale.verification ? (
                <p className="text-xs text-amber-700 font-semibold">Verified — bill abhi pending</p>
              ) : null}
              <button
                type="button"
                onClick={() => navigate('/admin/buyer-sales')}
                className="text-[10px] font-bold uppercase text-brand-olive underline"
              >
                Open buyer sales register →
              </button>
            </div>
          )}
        </PaperFormFrame>
      </div>

      {trip && (
        <div className="mt-6 print:mt-12 print-root">
          <PaperFormFrame
            title="End of Trip Sheet & POD Summary"
            subtitle={`Trip Number: ${trip.tripNumber || trip.tripNo || '—'} | Status: ${trip.status}`}
          >
            {trip.tripStartOdometer?.photoUrl && (
              <div className="mb-6 border border-black p-4 bg-[#F5F5EC]">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">
                  Trip start odometer
                </h3>
                <p className="text-sm font-bold text-[#6A7051] mb-2">
                  Starting reading: {trip.tripStartOdometer.odometerKm ?? '—'} km
                  {trip.tripStartOdometer.recordedAt
                    ? ` · ${new Date(trip.tripStartOdometer.recordedAt).toLocaleString()}`
                    : ''}
                </p>
                <img
                  src={trip.tripStartOdometer.photoUrl}
                  alt="Trip start odometer"
                  className="max-h-48 object-contain border border-gray-400 cursor-pointer"
                  onClick={() => window.open(trip.tripStartOdometer.photoUrl, '_blank')}
                />
              </div>
            )}
            {/* Odometer Telemetry Metrics Grid */}
            {postTrip ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-black p-3 bg-[#F5F5EC] text-center">
                  <span className="block text-[10px] uppercase font-bold text-gray-600">Start KM</span>
                  <span className="text-xl font-bold text-[#6A7051]">
                    {postTrip.startingKms || trip.tripStartOdometer?.odometerKm || 0}
                  </span>
                </div>
                <div className="border border-black p-3 bg-[#F5F5EC] text-center">
                  <span className="block text-[10px] uppercase font-bold text-gray-600">End KM</span>
                  <span className="text-xl font-bold text-[#6A7051]">{postTrip.endingKms || 0}</span>
                </div>
                <div className="border border-black p-3 bg-[#F5F5EC] text-center">
                  <span className="block text-[10px] uppercase font-bold text-gray-600">Distance Run</span>
                  <span className="text-xl font-bold text-[#EAB308]">{postTrip.totalKms || 0} km</span>
                </div>
                <div className="border border-black p-3 bg-[#F5F5EC] text-center">
                  <span className="block text-[10px] uppercase font-bold text-gray-600">Mileage</span>
                  <span className="text-xl font-bold text-[#6A7051]">{postTrip.mileage || 0} km/l</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic mb-4">No odometer telemetry submitted yet by the driver.</p>
            )}

            {/* Claim Settlement Expenses Ledger */}
            {postTrip ? (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">Claim Settlement Ledger</h3>
                <table className="w-full border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100 uppercase text-left">
                      <th className="border-r border-b border-black p-2">Expense Particulars</th>
                      <th className="border-b border-black p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">Diesel (Self-filled)</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.diesel || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">Toll / FASTag</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.tollFastag || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">RTO / PC / RMC Charges</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.rtoPcRmc || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">Maintenance / Repairs</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.maintenance || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">Driver Batta (Food & Allowance)</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.driverBatta || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-gray-300 p-2">Halting Charges</td>
                      <td className="border-b border-gray-300 p-2 text-right">₹{(postTrip.halting || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2">Pump Station Purchases (Detailed below)</td>
                      <td className="border-b border-black p-2 text-right font-medium">₹{(postTrip.pumpTotal || 0).toFixed(2)}</td>
                    </tr>

                    <tr className="bg-[#F5F5EC] font-bold">
                      <td className="border-r border-b border-black p-2 text-right uppercase">Gross Claims Total</td>
                      <td className="border-b border-black p-2 text-right">₹{(postTrip.totalExpenses || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold text-red-600">
                      <td className="border-r border-b border-black p-2 text-right uppercase">Less advance received</td>
                      <td className="border-b border-black p-2 text-right">- ₹{(postTrip.lessAdvance || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-[#6A7051] text-white font-bold text-sm">
                      <td className="border-r border-black p-2 text-right uppercase">Net Settlement Payable</td>
                      <td className="p-2 text-right">₹{(postTrip.balancePayable || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic mb-6">No post-trip expense claims submitted yet.</p>
            )}

            {/* Pump Station details */}
            {postTrip && postTrip.pumps && postTrip.pumps.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-600">Pump Stations Breakdown</h4>
                <table className="w-full border border-black text-xs text-left">
                  <thead className="bg-gray-50 uppercase text-[10px]">
                    <tr>
                      <th className="border-r border-b border-black p-1.5">Pump Station Name</th>
                      <th className="border-r border-b border-black p-1.5 text-right">Litres</th>
                      <th className="border-b border-black p-1.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postTrip.pumps.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-300">
                        <td className="border-r p-1.5 font-medium">{p.name || 'Unnamed Pump'}</td>
                        <td className="border-r p-1.5 text-right">{p.litres || 0} L</td>
                        <td className="p-1.5 text-right">₹{(p.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Driver Remarks */}
            {postTrip && postTrip.remarks && (
              <div className="border border-black bg-gray-50 p-3 text-xs mb-6">
                <strong className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Driver Remarks:</strong>
                <p className="italic text-gray-800">{postTrip.remarks}</p>
              </div>
            )}

            {/* Proof of Delivery attachments */}
            {(trip.proofPhotoUrl || trip.signatureUrl) && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">Proof of Delivery Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
                  {trip.proofPhotoUrl && (
                    <div className="border border-black p-2 bg-[#F5F5EC] flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-600 mb-1">Delivery Scale Proof Photo</span>
                      <div className="w-full h-48 overflow-hidden border border-gray-300 bg-white flex items-center justify-center relative group">
                        <img
                          src={trip.proofPhotoUrl}
                          alt="Scale Proof"
                          className="max-w-full max-h-full object-contain cursor-zoom-in"
                          onClick={() => window.open(trip.proofPhotoUrl, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                          <span className="text-white text-[10px] bg-black bg-opacity-75 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to expand
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {trip.signatureUrl && (
                    <div className="border border-black p-2 bg-[#F5F5EC] flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-600 mb-1">Customer E-Signature</span>
                      <div className="w-full h-48 overflow-hidden border border-gray-300 bg-white flex items-center justify-center relative group">
                        <img
                          src={trip.signatureUrl}
                          alt="Customer Signature"
                          className="max-w-full max-h-full object-contain cursor-zoom-in"
                          onClick={() => window.open(trip.signatureUrl, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                          <span className="text-white text-[10px] bg-black bg-opacity-75 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to expand
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Print-friendly POD display */}
                <div className="hidden print:block mt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2">POD Photos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {trip.proofPhotoUrl && (
                      <div className="text-center">
                        <img src={trip.proofPhotoUrl} alt="Scale Proof" className="max-h-40 mx-auto object-contain border border-black" />
                        <p className="text-[9px] uppercase mt-1">Scale Proof</p>
                      </div>
                    )}
                    {trip.signatureUrl && (
                      <div className="text-center">
                        <img src={trip.signatureUrl} alt="Customer Signature" className="max-h-40 mx-auto object-contain border border-black" />
                        <p className="text-[9px] uppercase mt-1">Customer Signature</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Claim Approval/Rejection Actions Console */}
            {postTrip && postTrip.status === 'PENDING' && (
              <div className="no-print mt-6 border-t border-black pt-4 bg-[#F5F5EC] p-4 border">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-[#6A7051]">Settlement Claim Action Console</h4>
                <p className="text-xs text-gray-600 mb-4">
                  This expense consolidation claim is currently awaiting review. Please verify the ledger details, distance telemetry, and POD documents above before taking action.
                </p>

                {!showRejectForm ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() => handleReview('APPROVED')}
                      className="flex-1 bg-[#6A7051] hover:bg-[#52573d] text-white text-xs font-bold uppercase tracking-wider py-2 border border-black transition-colors disabled:opacity-50"
                    >
                      {reviewing ? 'Processing...' : 'Approve Settlement Claim'}
                    </button>
                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() => setShowRejectForm(true)}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-2 border border-black transition-colors"
                    >
                      Reject Claim
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-red-700 mb-1">Rejection Reason / Explanation</label>
                      <textarea
                        className="w-full border border-gray-400 p-2 text-xs bg-white focus:outline-none focus:border-black"
                        rows={3}
                        placeholder="Please specify why this claim is being rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={reviewing}
                        onClick={() => handleReview('REJECTED')}
                        className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase py-1.5 px-4 border border-black disabled:opacity-50"
                      >
                        {reviewing ? 'Processing...' : 'Confirm Rejection'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason('');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-black text-xs font-bold uppercase py-1.5 px-4 border border-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {postTrip && postTrip.status !== 'PENDING' && (
              <div className={`mt-6 p-3 text-center border text-xs font-bold uppercase tracking-widest ${
                postTrip.status === 'APPROVED'
                  ? 'bg-[#6A7051] text-white border-black'
                  : 'bg-red-100 text-red-700 border-red-700'
              }`}>
                Settlement {postTrip.status}
                {postTrip.status === 'APPROVED' && postTrip.reviewedBy && (
                  <span className="block text-[10px] font-normal tracking-normal normal-case mt-0.5">
                    Reviewed at {postTrip.reviewedAt ? new Date(postTrip.reviewedAt).toLocaleString() : '—'}
                  </span>
                )}
                {postTrip.paymentStatus === 'PAID' && (
                  <span className="block text-[10px] font-normal tracking-normal normal-case mt-1">
                    Paid ₹{Number(postTrip.paidAmount || 0).toLocaleString('en-IN')} · UPI: {postTrip.upiTransactionId}
                  </span>
                )}
                {postTrip.status === 'REJECTED' && postTrip.rejectionReason && (
                  <span className="block text-[10px] font-normal tracking-normal normal-case mt-0.5">
                    Reason: "{postTrip.rejectionReason}"
                  </span>
                )}
              </div>
            )}

            {postTrip && postTrip.status === 'APPROVED' && postTrip.paymentStatus !== 'PAID' && (
              <div className="no-print mt-6">
                <TripSettlementPaymentForm trip={trip} onConfirm={handleConfirmPayment} loading={paying} inline />
              </div>
            )}
          </PaperFormFrame>
        </div>
      )}
    </div>
  );
};

export default TapalDetail;
