import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../../services/tapalService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import AssignDriverPanel from '../shared/AssignDriverPanel';
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

  if (!tapal) return <p className="p-8 text-sm">Loading...</p>;

  const lines = tapal.products || [];
  const printDoc = () => window.print();
  const postTrip = trip?.postTripExpenses;

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-between items-center">
        <button type="button" onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={printDoc}
          className="flex items-center gap-1 text-xs font-bold uppercase border px-3 py-2"
        >
          <Printer size={14} /> Print Tapal
        </button>
      </div>
      <div className="no-print mb-6">
        <AssignDriverPanel tapal={tapal} onAssigned={loadTapal} />
      </div>

      <div className="print-root">
        <PaperFormFrame title={`Tapal ${tapal.tpNo || tapal.tapalNumber}`} subtitle="Dispatch record">
          <PaperFieldRow label="Harvest Ref">
            <input className={paperInputClass} readOnly value={tapal.harvest?.harvestNumber || tapal.harvestId || '—'} />
          </PaperFieldRow>
          <PaperFieldRow label="Party">
            <input className={paperInputClass} readOnly value={tapal.partyName || ''} />
          </PaperFieldRow>
          <PaperFieldRow label="Destination">
            <input className={paperInputClass} readOnly value={tapal.destination || tapal.unloadingPoint || ''} />
          </PaperFieldRow>
          <PaperFieldRow label="Vehicle">
            <input className={paperInputClass} readOnly value={tapal.vehicleNumber || ''} />
          </PaperFieldRow>
          <PaperFieldRow label="Driver">
            <input className={paperInputClass} readOnly value={tapal.driver || ''} />
          </PaperFieldRow>
          <PaperFieldRow label="Status">
            <input className={paperInputClass} readOnly value={tapal.status || ''} />
          </PaperFieldRow>
          <table className="w-full border border-black text-xs mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1">Item</th>
                <th className="border border-black p-1">Qty</th>
                <th className="border border-black p-1">Box</th>
                <th className="border border-black p-1">Weight</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((p, i) => (
                <tr key={i}>
                  <td className="border border-black p-1">{p.name || p.fishName}</td>
                  <td className="border border-black p-1 text-right">{p.qty}</td>
                  <td className="border border-black p-1 text-right">{p.boxQty}</td>
                  <td className="border border-black p-1 text-right">{p.totalWeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PaperFormFrame>
      </div>

      {trip && (
        <div className="mt-6 print:mt-12 print-root">
          <PaperFormFrame
            title="End of Trip Sheet & POD Summary"
            subtitle={`Trip Number: ${trip.tripNumber || trip.tripNo || '—'} | Status: ${trip.status}`}
          >
            {/* Odometer Telemetry Metrics Grid */}
            {postTrip ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-black p-3 bg-[#F5F5EC] text-center">
                  <span className="block text-[10px] uppercase font-bold text-gray-600">Start KM</span>
                  <span className="text-xl font-bold text-[#6A7051]">{postTrip.startingKms || 0}</span>
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
                    Reviewed by {postTrip.reviewedBy} at {new Date(postTrip.reviewedAt).toLocaleString()}
                  </span>
                )}
                {postTrip.status === 'REJECTED' && postTrip.rejectionReason && (
                  <span className="block text-[10px] font-normal tracking-normal normal-case mt-0.5">
                    Reason: "{postTrip.rejectionReason}"
                  </span>
                )}
              </div>
            )}
          </PaperFormFrame>
        </div>
      )}
    </div>
  );
};

export default TapalDetail;
