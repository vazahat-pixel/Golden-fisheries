import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle, IndianRupee, Trash2, ArrowRight, Save, Clock, Receipt, Printer, X } from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';
import { Button } from '../../design-system/components/Button';
import { toast } from 'react-hot-toast';

const FishMallClosing = () => {
  const { stock, accountingSummary, fetchAccountingSummaryAsync, closeSessionAsync, activeSession } = useFishMallStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [lastSessionReport, setLastSessionReport] = useState(null);

  useEffect(() => {
    fetchAccountingSummaryAsync();
  }, [fetchAccountingSummaryAsync]);

  const [closingData, setClosingData] = useState({
    actualClosingCash: '',
    actualClosingUpi: '',
    wasteRecords: {}, // id: kg
    notes: ''
  });

  if (!activeSession && step < 6) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl shadow-xl p-8 text-center space-y-4">
          <Clock className="mx-auto text-gray-300" size={48} />
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Shift Closed</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-normal">
            No active open shift session was found. Day cannot start without opening balance. Please open shift on Terminal Dashboard first.
          </p>
        </div>
      </div>
    );
  }

  const expectedClosingCash = accountingSummary?.expectedClosingCash || activeSession?.openingCash || 0;
  const expectedClosingUpi = accountingSummary?.expectedClosingUpi || 0;

  const handleStepNext = () => {
    if (step === 2) {
      if (closingData.actualClosingCash === '' || closingData.actualClosingUpi === '') {
        toast.error('Please report both actual physical cash and UPI collected');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const closedSession = await closeSessionAsync({
        actualClosingCash: parseFloat(closingData.actualClosingCash),
        actualClosingUpi: parseFloat(closingData.actualClosingUpi),
        closingNotes: closingData.notes
      });
      setLastSessionReport(closedSession);
      toast.success('Operational Cashbook Shift Closed and Sealed Successfully!');
      setStep(6); // Success view
    } catch (err) {
      toast.error(err?.message || 'Failed to seal daily shift');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[#6B7550]/5 border border-[#6B7550]/20 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-[#6B7550] text-white rounded-xl shadow-lg shadow-[#6B7550]/20"><ClipboardCheck size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Step 1: Stock Verification</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Review live inventory levels before EOD shift lock</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fish Name</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Closing Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stock.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-tight">{item.name}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-[#6B7550] text-right">{item.qty} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleStepNext} className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] bg-[#6B7550] rounded-xl">
              Proceed to Cashbook Tally <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"><IndianRupee size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Step 2: Split Cash & UPI Balance Reconcile</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Reconcile counter physical cash and UPI reports</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash Section */}
              <div className="bg-white p-6 border border-gray-100 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-gray-50 pb-2">Physical Cash Float</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expected Cash</span>
                  <span className="text-sm font-black text-gray-900">₹{expectedClosingCash.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Actual Physical Cash Tally</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-200 pl-8 pr-3 py-3 text-xs font-black text-gray-900 focus:bg-white outline-none focus:border-[#6B7550] rounded-xl transition-all"
                      value={closingData.actualClosingCash}
                      onChange={e => setClosingData({...closingData, actualClosingCash: e.target.value})}
                    />
                  </div>
                </div>
                {closingData.actualClosingCash !== '' && (
                  <div className="flex justify-between items-center text-[9px] font-black border-t border-gray-50 pt-3">
                    <span>Variance Difference</span>
                    <span className={expectedClosingCash - parseFloat(closingData.actualClosingCash) === 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      ₹{(expectedClosingCash - parseFloat(closingData.actualClosingCash)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* UPI Section */}
              <div className="bg-white p-6 border border-gray-100 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-gray-50 pb-2">UPI Collection Tally</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expected UPI</span>
                  <span className="text-sm font-black text-gray-900">₹{expectedClosingUpi.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Actual UPI Reports Tally</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-200 pl-8 pr-3 py-3 text-xs font-black text-gray-900 focus:bg-white outline-none focus:border-[#6B7550] rounded-xl transition-all"
                      value={closingData.actualClosingUpi}
                      onChange={e => setClosingData({...closingData, actualClosingUpi: e.target.value})}
                    />
                  </div>
                </div>
                {closingData.actualClosingUpi !== '' && (
                  <div className="flex justify-between items-center text-[9px] font-black border-t border-gray-50 pt-3">
                    <span>Variance Difference</span>
                    <span className={expectedClosingUpi - parseFloat(closingData.actualClosingUpi) === 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      ₹{(expectedClosingUpi - parseFloat(closingData.actualClosingUpi)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleStepNext} className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] bg-[#6B7550] rounded-xl">
              Proceed to Waste Log <ArrowRight className="ml-2" size={16} />
            </Button>
            <button onClick={() => setStep(1)} className="w-full text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Go Back</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20"><Trash2 size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Step 3: Daily Waste Calculations</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Record weight loss or spoiled fish for adjustment</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
               <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fish Type</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Waste (KG)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stock.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-tight">{item.name}</td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number"
                          placeholder="0.0"
                          className="w-24 bg-gray-50 border border-gray-200 px-3 py-2 text-[10px] font-black text-right outline-none focus:border-red-500 rounded-lg transition-all"
                          value={closingData.wasteRecords[item.id] || ''}
                          onChange={e => setClosingData({
                            ...closingData, 
                            wasteRecords: { ...closingData.wasteRecords, [item.id]: e.target.value }
                          })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleStepNext} className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] bg-[#6B7550] rounded-xl">
              Proceed to Final Review <ArrowRight className="ml-2" size={16} />
            </Button>
            <button onClick={() => setStep(2)} className="w-full text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Go Back</button>
          </div>
        );
      case 4:
        const grossRev = (accountingSummary?.salesTotal || 0) + (accountingSummary?.transfersTotal || 0);
        const netProfitLoss = grossRev - (accountingSummary?.expensesTotal || 0);

        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20"><Save size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Final Step: Shift Summary & Seal</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Review double-entry shift ledgers before locking shift</p>
              </div>
            </div>

            {/* P&L Card */}
            <div className="bg-black text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Daily Shift Mini P&L Statement</p>
                <h3 className="text-2xl font-black mt-2">₹{netProfitLoss.toLocaleString()} Net shift yield</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-gray-400">
                <div className="flex justify-between border-r border-white/10 pr-4">
                  <span>Retail Sales</span>
                  <span className="text-white">₹{(accountingSummary?.salesTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Internal Transfers</span>
                  <span className="text-white">₹{(accountingSummary?.transfersTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-r border-white/10 pr-4">
                  <span>Shift Expenses</span>
                  <span className="text-rose-400">₹{(accountingSummary?.expensesTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Opening Float</span>
                  <span className="text-white">₹{(accountingSummary?.openingCash || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Reconcile Tally Breakdown */}
            <div className="bg-white p-6 border border-gray-100 rounded-3xl space-y-4 shadow-sm">
               <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-2">Shift Variance Balance Sheet</h4>
               <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>Physical Cash Reported</span>
                  <span className="text-gray-900">₹{parseFloat(closingData.actualClosingCash).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>Expected Cash-on-hand</span>
                  <span className="text-gray-900">₹{expectedClosingCash.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>Cash Variance Discrepancy</span>
                  <span className={expectedClosingCash - parseFloat(closingData.actualClosingCash) === 0 ? 'text-emerald-500' : 'text-rose-500'}>
                    ₹{(expectedClosingCash - parseFloat(closingData.actualClosingCash)).toLocaleString()}
                  </span>
               </div>
               <div className="border-t border-gray-50 pt-2 flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>Physical UPI Reported</span>
                  <span className="text-gray-900">₹{parseFloat(closingData.actualClosingUpi).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>Expected UPI Collection</span>
                  <span className="text-gray-900">₹{expectedClosingUpi.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                  <span>UPI Variance Discrepancy</span>
                  <span className={expectedClosingUpi - parseFloat(closingData.actualClosingUpi) === 0 ? 'text-emerald-500' : 'text-rose-500'}>
                    ₹{(expectedClosingUpi - parseFloat(closingData.actualClosingUpi)).toLocaleString()}
                  </span>
               </div>
               
               <div className="space-y-2 pt-4">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manager Tally Observation Notes</label>
                 <textarea 
                   className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-[10px] font-bold outline-none rounded-xl h-20"
                   placeholder="Register any shift variances, counting issues, or stock audit anomalies..."
                   value={closingData.notes}
                   onChange={e => setClosingData({...closingData, notes: e.target.value})}
                 />
               </div>
            </div>

            <Button 
              onClick={handleFinalSubmit} 
              disabled={submitting} 
              className="w-full py-8 text-[11px] font-black uppercase tracking-[0.3em] bg-black text-white hover:bg-[#6B7550] rounded-2xl shadow-2xl transition-all"
            >
              {submitting ? 'Locking shift and calculations...' : 'Lock Ledger & Seal Shift'}
            </Button>
            <button onClick={() => setStep(3)} className="w-full text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Go Back</button>
          </div>
        );
      case 6:
        const report = lastSessionReport || {};
        return (
          <div className="max-w-md mx-auto w-full">
            <div className="no-print flex justify-between items-center mb-6">
              <button 
                onClick={() => { setStep(1); setLastSessionReport(null); }} 
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[9px]"
              >
                <X size={14} /> Close Sheet
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-[#6B7550] text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center gap-1.5 shadow-xl shadow-[#6B7550]/20"
              >
                <Printer size={14} /> Print Balance Sheet
              </button>
            </div>

            <div className="print-root p-8 bg-white border border-gray-100 rounded-3xl shadow-xl space-y-8 animate-in zoom-in-95 duration-500">

            <div className="text-center space-y-2">
              <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-16 mx-auto mb-2" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">GOLDEN FISH MALL</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operational Cashbook Shift Seal Report</p>
              <p className="text-[8px] text-gray-400">Terminal: #FM-02 • Shift Number: {report.sessionNumber || 'FMS-0000'}</p>
            </div>

            <div className="border-t-2 border-b-2 border-gray-100 py-4 flex justify-between items-center text-[9px] font-bold uppercase text-gray-500">
              <div>
                <p className="text-gray-400 mb-1">Shift Opened</p>
                <p className="text-gray-900">{report.openingDate ? new Date(report.openingDate).toLocaleString() : '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-1">Shift Closed</p>
                <p className="text-gray-900">{report.closingDate ? new Date(report.closingDate).toLocaleString() : '—'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">Shift Profit & Loss Summary</h4>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Shift Retail Sales</span>
                <span className="text-gray-900">₹{(report.salesTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Shift Internal Transfers</span>
                <span className="text-gray-900">₹{(report.transfersTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Shift Gross Revenue</span>
                <span className="text-gray-900">₹{(report.grossRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Shift Petty Expenses</span>
                <span className="text-rose-500">₹{(report.expensesTotal || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-xs font-black uppercase text-gray-900">
                <span>Shift Net P&L Yield</span>
                <span className="text-lg">₹{(report.netPnL || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">Shift Cash & UPI Reconciliation</h4>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Starting Float Cash</span>
                <span className="text-gray-900">₹{(report.openingCash || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Expected Closing Cash</span>
                <span className="text-gray-900">₹{(report.expectedClosingCash || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Actual Physical Cash</span>
                <span className="text-gray-900">₹{(report.actualClosingCash || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Cash Discrepancy Variance</span>
                <span className={report.cashDiscrepancy === 0 ? 'text-emerald-600' : 'text-rose-500'}>
                  ₹{(report.cashDiscrepancy || 0).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Expected UPI Collection</span>
                <span className="text-gray-900">₹{(report.expectedClosingUpi || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>Actual UPI Collection</span>
                <span className="text-gray-900">₹{(report.actualClosingUpi || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-600">
                <span>UPI Discrepancy Variance</span>
                <span className={report.upiDiscrepancy === 0 ? 'text-emerald-600' : 'text-rose-500'}>
                  ₹{(report.upiDiscrepancy || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {report.closingNotes && (
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Manager Tally Remarks</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">{report.closingNotes}</p>
              </div>
            )}

            <div className="text-center pt-8 border-t border-gray-100 text-[8px] text-gray-400 font-bold uppercase tracking-widest">
              Shift Sealed & locked • Golden Fish Mall Terminal Management
            </div>
            </div>{/* end print-root */}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center justify-center gap-3">
          <Clock className="text-[#6B7550]" /> Operational Closing Terminal
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Shift Cashbook Reconciliation & Ledger Locking</p>
      </div>

      {step < 6 && (
        <div className="flex justify-between items-center px-4 relative">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                step >= s ? 'bg-black text-white border-black' : 'bg-white text-gray-200 border-gray-100'
              }`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest ${step >= s ? 'text-black' : 'text-gray-300'}`}>
                {s === 1 ? 'Stock' : s === 2 ? 'Cash & UPI' : s === 3 ? 'Waste' : 'Seal Shift'}
              </span>
            </div>
          ))}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-[20px] -z-10" />
        </div>
      )}

      {renderStep()}
    </div>
  );
};

export default FishMallClosing;
