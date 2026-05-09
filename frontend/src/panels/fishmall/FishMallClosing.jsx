import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle, IndianRupee, Trash2, ArrowRight, Save, Clock } from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';
import { Button } from '../../design-system/components/Button';
import { toast } from 'react-hot-toast';

const FishMallClosing = () => {
  const { stock, bills, recordClosing } = useFishMallStore();
  const [step, setStep] = useState(1);
  const [closingData, setClosingData] = useState({
    cashReported: '',
    wasteRecords: {}, // id: kg
    notes: ''
  });

  const totalSalesValue = bills.filter(b => {
    const billDate = new Date(b.timestamp).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return billDate === today;
  }).reduce((acc, b) => acc + b.total, 0);

  const handleStepNext = () => {
    if (step === 2 && !closingData.cashReported) {
      toast.error('Please report cash collected');
      return;
    }
    setStep(step + 1);
  };

  const handleFinalSubmit = () => {
    recordClosing({
      ...closingData,
      systemSales: totalSalesValue,
      date: new Date().toISOString().split('T')[0]
    });
    toast.success('Daily Closing Submitted Successfully!');
    setStep(6); // Final success view
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
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Review live inventory levels before EOD submission</p>
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
              Proceed to Cash Tally <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"><IndianRupee size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Step 2: Cash Tally</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Reconcile physical cash with system sales</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 border border-gray-100 rounded-3xl space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Sales (Today)</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{totalSalesValue.toLocaleString()}</p>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Verified by terminal</p>
              </div>
              <div className="bg-white p-8 border border-gray-100 rounded-3xl space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Actual Cash Collected</p>
                <div className="relative">
                  <IndianRupee className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
                  <input 
                    type="number"
                    className="w-full bg-transparent border-none text-4xl font-black text-gray-900 p-0 pl-8 focus:ring-0 placeholder:text-gray-100"
                    placeholder="0.00"
                    value={closingData.cashReported}
                    onChange={e => setClosingData({...closingData, cashReported: e.target.value})}
                  />
                </div>
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
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Step 3: Waste Calculation</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Record weight loss or spoiled fish for adjustment</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
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
                          className="w-24 bg-gray-50 border border-gray-100 px-3 py-2 text-[10px] font-black text-right outline-none focus:border-red-500 rounded-lg transition-all"
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
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20"><Save size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Final Step: Summary & Submit</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Review all data before locking the daily ledger</p>
              </div>
            </div>
            <div className="bg-white p-8 border border-gray-100 rounded-3xl space-y-6 shadow-xl shadow-gray-200/50">
               <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Sales</span>
                  <span className="text-lg font-black text-gray-900">₹{totalSalesValue.toLocaleString()}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physical Cash</span>
                  <span className="text-lg font-black text-[#6B7550]">₹{parseFloat(closingData.cashReported).toLocaleString()}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variance</span>
                  <span className={`text-lg font-black ${parseFloat(closingData.cashReported) - totalSalesValue === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ₹{(parseFloat(closingData.cashReported) - totalSalesValue).toLocaleString()}
                  </span>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manager Notes</label>
                 <textarea 
                   className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-[10px] font-bold outline-none rounded-xl h-24"
                   placeholder="Enter any closing observations..."
                   value={closingData.notes}
                   onChange={e => setClosingData({...closingData, notes: e.target.value})}
                 />
               </div>
            </div>
            <Button onClick={handleFinalSubmit} className="w-full py-8 text-[11px] font-black uppercase tracking-[0.3em] bg-black text-white hover:bg-[#6B7550] rounded-2xl shadow-2xl transition-all">
              Lock Ledger & Close Day
            </Button>
            <button onClick={() => setStep(3)} className="w-full text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Go Back</button>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-emerald-500/10">
               <CheckCircle2 size={48} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Day Closed Successfully</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Operational portal locked for maintenance</p>
             </div>
             <div className="bg-white p-6 border border-gray-100 rounded-2xl max-w-sm w-full">
                <div className="flex items-center justify-between text-[9px] font-black uppercase text-gray-400">
                  <span>Terminal ID</span>
                  <span className="text-gray-900">GF-FM-02</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-black uppercase text-gray-400 mt-2">
                  <span>Timestamp</span>
                  <span className="text-gray-900">{new Date().toLocaleString()}</span>
                </div>
             </div>
             <Button onClick={() => setStep(1)} variant="outline" className="text-[9px] font-black uppercase tracking-widest border-gray-200 h-12 px-10">
               View All Closings
             </Button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center justify-center gap-3">
          <Clock className="text-[#6B7550]" /> Operational Closing
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End of day reconciliation and ledger locking</p>
      </div>

      {step < 6 && (
        <div className="flex justify-between items-center px-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                step >= s ? 'bg-black text-white border-black' : 'bg-white text-gray-200 border-gray-100'
              }`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest ${step >= s ? 'text-black' : 'text-gray-300'}`}>
                {s === 1 ? 'Stock' : s === 2 ? 'Cash' : s === 3 ? 'Waste' : 'Submit'}
              </span>
            </div>
          ))}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-50 -z-10 top-1/2" />
        </div>
      )}

      {renderStep()}
    </div>
  );
};

export default FishMallClosing;
