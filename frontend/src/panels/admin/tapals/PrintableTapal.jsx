import React from 'react';
import { clsx } from 'clsx';

export const PrintableTapal = React.forwardRef(({ tapal }, ref) => {
  if (!tapal) return null;

  // Mock data/calculated fields for the printable format
  const date = tapal.date || new Date().toLocaleDateString('en-GB');
  const vehicleNo = tapal.vehicleNumber || '—';
  const driverName = tapal.driver || '—';
  const driverMob = tapal.driverPhone || '—';
  
  const products = tapal.products || [
    { name: 'GENERAL FISH', qty: tapal.qty || '0', rate: '—', total: tapal.amount || '—', boxQty: tapal.boxQty, weightPerBox: tapal.weightPerBox }
  ];

  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] p-8 bg-white text-black font-sans print:p-4 mx-auto border border-gray-200 print:border-none">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-[10px] font-bold">GSTIN : 29ANOPB3353L1ZO</div>
        <div className="text-[10px] font-bold text-right leading-tight">
          Mob : 9019411439<br />
          : 9663655558
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black tracking-tight text-blue-900">M K ENTERPRISES</h1>
        <p className="text-xs font-bold text-blue-900 tracking-[0.2em]">KARWAR-581 301.</p>
        <div className="mt-2 inline-block border-2 border-blue-900 rounded-lg px-6 py-1 text-sm font-black text-blue-900 uppercase">
          TAPAL
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 border-2 border-blue-900 mb-6">
        {/* Left Section: To */}
        <div className="border-r-2 border-blue-900 flex flex-col">
          <div className="p-2 border-b-2 border-blue-900 h-10 flex items-center">
            <span className="text-sm font-bold text-blue-900 mr-2">No.</span>
            <span className="text-lg font-bold text-red-600">{tapal.id?.replace(/\D/g, '') || '1799'}</span>
          </div>
          <div className="p-3 flex-1">
             <div className="flex items-start">
               <span className="text-sm font-bold text-blue-900 mr-3 mt-1">To</span>
               <div className="flex-1 border-b border-blue-900 min-h-[80px] text-xl font-bold uppercase py-1">
                 {tapal.party}
               </div>
             </div>
          </div>
        </div>

        {/* Right Section: Details */}
        <div className="flex flex-col">
          <div className="grid grid-cols-[100px_1fr] border-b-2 border-blue-900">
            <div className="p-2 border-r-2 border-blue-900 text-sm font-bold text-blue-900 text-right">Date :</div>
            <div className="p-2 text-sm font-bold">{date}</div>
          </div>
          <div className="grid grid-cols-[100px_1fr] border-b-2 border-blue-900">
            <div className="p-2 border-r-2 border-blue-900 text-sm font-bold text-blue-900 text-right">Vehicle No. :</div>
            <div className="p-2 text-sm font-bold uppercase">{vehicleNo}</div>
          </div>
          <div className="grid grid-cols-[100px_1fr] border-b-2 border-blue-900">
            <div className="p-2 border-r-2 border-blue-900 text-sm font-bold text-blue-900 text-right">Driver Name :</div>
            <div className="p-2 text-sm font-bold uppercase">{driverName}</div>
          </div>
          <div className="grid grid-cols-[100px_1fr]">
            <div className="p-2 border-r-2 border-blue-900 text-sm font-bold text-blue-900 text-right">Driver Mob :</div>
            <div className="p-2 text-sm font-bold uppercase">{driverMob}</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-2 border-blue-900 mb-6">
        <thead>
          <tr className="border-b-2 border-blue-900 bg-blue-50/50">
            <th className="border-r-2 border-blue-900 p-2 text-xs font-bold text-blue-900 w-12">Sl. No.</th>
            <th className="border-r-2 border-blue-900 p-2 text-xs font-bold text-blue-900">Particulars</th>
            <th className="border-r-2 border-blue-900 p-2 text-xs font-bold text-blue-900 w-24 text-center">Count</th>
            <th className="border-r-2 border-blue-900 p-2 text-xs font-bold text-blue-900 w-24 text-center">Box</th>
            <th className="border-r-2 border-blue-900 p-2 text-xs font-bold text-blue-900 w-28 text-center">Box Weight</th>
            <th className="p-2 text-xs font-bold text-blue-900 w-28 text-center">Total Weight</th>
          </tr>
        </thead>
        <tbody className="min-h-[400px]">
          {products.map((p, i) => (
            <tr key={i} className="border-b border-blue-900/30 h-10">
              <td className="border-r-2 border-blue-900 p-2 text-center text-sm font-bold">{i + 1})</td>
              <td className="border-r-2 border-blue-900 p-2 text-sm font-bold uppercase">{p.name || p.fishName}</td>
              <td className="border-r-2 border-blue-900 p-2 text-center text-sm font-bold">→</td>
              <td className="border-r-2 border-blue-900 p-2 text-center text-sm font-bold">{p.boxQty || '—'}</td>
              <td className="border-r-2 border-blue-900 p-2 text-center text-sm font-bold">{p.weightPerBox || '—'}</td>
              <td className="p-2 text-center text-sm font-black">{p.qty || p.quantity}</td>
            </tr>
          ))}
          {/* Fill empty rows to maintain height */}
          {[...Array(10 - products.length)].map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-blue-900/30 h-10">
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-blue-900 bg-blue-50/50 h-10">
            <td colSpan={3} className="border-r-2 border-blue-900 p-2 text-right text-sm font-black text-blue-900 uppercase">Total</td>
            <td className="border-r-2 border-blue-900 p-2 text-center text-lg font-black text-red-600">
              {products.reduce((acc, curr) => acc + Number(curr.boxQty || 0), 0)}
            </td>
            <td className="border-r-2 border-blue-900 p-2"></td>
            <td className="p-2 text-center text-lg font-black">
              {tapal.qty}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Notes */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="space-y-1">
           <div className="flex items-start gap-2 text-[10px] font-bold italic text-blue-900">
             <span>*</span>
             <div className="border-b border-blue-900 flex-1 h-4"></div>
           </div>
           <div className="flex items-start gap-2 text-[10px] font-bold italic text-blue-900">
             <span>*</span>
             <div className="border-b border-blue-900 flex-1 h-4"></div>
           </div>
        </div>
        <div className="text-right pt-10">
           <div className="inline-block border-t border-blue-900 w-48 pt-1 text-[10px] font-black uppercase text-blue-900 text-center">
             Receiver's Signature
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; }
          .printable-content { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
});
