import React from 'react';

/**
 * PrintableTapal — Real Seafood Business Tapal Slip Format
 * Matches the M K Enterprises Tapal slip structure confirmed by client.
 * Renders full slip with: Header, Driver+Vehicle info, Line Items with Box/Weight columns, Footer totals.
 */
export const PrintableTapal = React.forwardRef(({ tapal }, ref) => {
  if (!tapal) return null;

  const date = tapal.createdAt
    ? new Date(tapal.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');

  const vehicleNo = tapal.vehicleNumber || '—';
  const driverName = tapal.driver || '—';
  const driverMob = tapal.driverPhone || '—';
  const partyName = tapal.partyName || '—';
  const tapalNo = tapal.tapalNumber || '—';
  // Display Harvest number if linked (Harvest → Tapal chain)
  const harvestNo = tapal.harvestId?.harvestNumber || tapal.harvestNumber || null;

  const products = tapal.products || [];

  // Total boxes across all line items
  const totalBoxes = products.reduce((acc, p) => acc + Number(p.boxQty || 0), 0);
  // Total weight — use the Tapal's canonical numericQty or parse from qty string
  const totalWeight = tapal.numericQty
    ? `${tapal.numericQty} KG`
    : (tapal.qty || '—');

  // Pad table to minimum 10 rows for proper printed appearance
  const MIN_ROWS = 10;
  const emptyRows = Math.max(0, MIN_ROWS - products.length);

  return (
    <div
      ref={ref}
      className="w-[210mm] min-h-[297mm] p-8 bg-white text-black font-sans print:p-6 mx-auto border border-gray-200 print:border-none"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* ── Business Header ── */}
      <div className="flex justify-between items-start mb-1">
        <div className="text-[10px] font-bold text-gray-700">GSTIN : 29ANOPB3353L1ZO</div>
        <div className="text-[10px] font-bold text-right leading-tight text-gray-700">
          Mob : 9019411439<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 9663655558
        </div>
      </div>

      {/* ── Company Name + Title ── */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-black tracking-tight text-blue-900 uppercase">M K ENTERPRISES</h1>
        <p className="text-[10px] font-bold text-blue-900 tracking-widest mt-0.5">KARWAR - 581 301.</p>
        <div className="mt-3 inline-block border-2 border-blue-900 rounded-lg px-8 py-1.5">
          <span className="text-sm font-black text-blue-900 uppercase tracking-[0.3em]">TAPAL</span>
        </div>
      </div>

      {/* ── Info Grid: Party + Details ── */}
      <div className="grid grid-cols-2 border-2 border-blue-900 mb-4">
        {/* Left: Party / To */}
        <div className="border-r-2 border-blue-900 flex flex-col">
          {/* Tapal Number + Harvest ref */}
          <div className="p-2 border-b-2 border-blue-900 flex items-center gap-3">
            <span className="text-[11px] font-bold text-blue-900">No.</span>
            <span className="text-lg font-black text-red-600">{tapalNo.replace(/\D/g, '') || '—'}</span>
            {harvestNo && (
              <span className="text-[9px] font-bold text-gray-500 ml-auto">
                Harvest: {harvestNo}
              </span>
            )}
          </div>
          {/* Party Name */}
          <div className="p-3 flex-1 min-h-[80px]">
            <div className="flex items-start gap-2">
              <span className="text-sm font-bold text-blue-900 mt-1">To</span>
              <div className="flex-1 border-b border-blue-900 min-h-[70px] py-1">
                <p className="text-lg font-bold uppercase leading-tight">{partyName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Date / Vehicle / Driver */}
        <div className="flex flex-col">
          <div className="grid grid-cols-[110px_1fr] border-b-2 border-blue-900 h-10">
            <div className="p-2 border-r-2 border-blue-900 text-[11px] font-bold text-blue-900 text-right flex items-center justify-end">Date :</div>
            <div className="p-2 text-[11px] font-bold flex items-center">{date}</div>
          </div>
          <div className="grid grid-cols-[110px_1fr] border-b-2 border-blue-900 h-10">
            <div className="p-2 border-r-2 border-blue-900 text-[11px] font-bold text-blue-900 text-right flex items-center justify-end">Tapal No. :</div>
            <div className="p-2 text-[11px] font-black text-red-600 flex items-center">{tapalNo}</div>
          </div>
          <div className="grid grid-cols-[110px_1fr] border-b-2 border-blue-900 h-10">
            <div className="p-2 border-r-2 border-blue-900 text-[11px] font-bold text-blue-900 text-right flex items-center justify-end">Vehicle No. :</div>
            <div className="p-2 text-[11px] font-bold uppercase flex items-center">{vehicleNo}</div>
          </div>
          <div className="grid grid-cols-[110px_1fr] border-b-2 border-blue-900 h-10">
            <div className="p-2 border-r-2 border-blue-900 text-[11px] font-bold text-blue-900 text-right flex items-center justify-end">Driver Name :</div>
            <div className="p-2 text-[11px] font-bold uppercase flex items-center">{driverName}</div>
          </div>
          <div className="grid grid-cols-[110px_1fr] h-10">
            <div className="p-2 border-r-2 border-blue-900 text-[11px] font-bold text-blue-900 text-right flex items-center justify-end">Driver Mob :</div>
            <div className="p-2 text-[11px] font-bold flex items-center">{driverMob}</div>
          </div>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table className="w-full border-2 border-blue-900 mb-4" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="border-b-2 border-blue-900 bg-blue-50">
            <th className="border-r-2 border-blue-900 p-2 text-[10px] font-black text-blue-900 w-10 text-center">Sl.</th>
            <th className="border-r-2 border-blue-900 p-2 text-[10px] font-black text-blue-900 text-left">Particulars (Fish Type)</th>
            <th className="border-r-2 border-blue-900 p-2 text-[10px] font-black text-blue-900 w-20 text-center">Count</th>
            <th className="border-r-2 border-blue-900 p-2 text-[10px] font-black text-blue-900 w-20 text-center">Box Qty</th>
            <th className="border-r-2 border-blue-900 p-2 text-[10px] font-black text-blue-900 w-24 text-center">Wt/Box (KG)</th>
            <th className="p-2 text-[10px] font-black text-blue-900 w-28 text-center">Total Wt (KG)</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            // Auto-calculate total weight from box fields if available
            const autoWeight = (p.boxQty && p.weightPerBox)
              ? (p.boxQty * p.weightPerBox).toFixed(2)
              : null;
            // Extract numeric from qty string e.g. "300 KG" → "300"
            const displayQty = p.qty
              ? p.qty.replace(/[^0-9.]/g, '')
              : (autoWeight || '—');

            return (
              <tr key={i} className="border-b border-blue-900/30 h-10">
                <td className="border-r-2 border-blue-900 p-2 text-center text-[11px] font-bold">{i + 1})</td>
                <td className="border-r-2 border-blue-900 p-2 text-[11px] font-bold uppercase">{p.name || p.fishName}</td>
                <td className="border-r-2 border-blue-900 p-2 text-center text-[11px] font-bold text-gray-400">—</td>
                <td className="border-r-2 border-blue-900 p-2 text-center text-[11px] font-black">
                  {p.boxQty != null ? p.boxQty : '—'}
                </td>
                <td className="border-r-2 border-blue-900 p-2 text-center text-[11px] font-bold">
                  {p.weightPerBox != null ? p.weightPerBox : '—'}
                </td>
                <td className="p-2 text-center text-[12px] font-black">{displayQty}</td>
              </tr>
            );
          })}
          {/* Fill empty rows */}
          {Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-blue-900/20 h-10">
              <td className="border-r-2 border-blue-900 p-2 text-[11px]">&nbsp;</td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="border-r-2 border-blue-900 p-2"></td>
              <td className="p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-blue-900 bg-blue-50 h-10">
            <td colSpan={3} className="border-r-2 border-blue-900 p-2 text-right text-[11px] font-black text-blue-900 uppercase">
              Total
            </td>
            <td className="border-r-2 border-blue-900 p-2 text-center text-[14px] font-black text-red-600">
              {totalBoxes > 0 ? totalBoxes : '—'}
            </td>
            <td className="border-r-2 border-blue-900 p-2"></td>
            <td className="p-2 text-center text-[14px] font-black text-blue-900">
              {totalWeight}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Notes + Amount Box ── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Notes */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-2">Notes / Remarks</p>
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-blue-900 mt-0.5">*</span>
              <div className="border-b border-blue-900 flex-1 h-4"></div>
            </div>
          ))}
        </div>
        {/* Amount Summary */}
        <div className="border-2 border-blue-900 p-3">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-2">Amount Summary</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span>Total Weight :</span>
              <span className="font-black">{totalWeight}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span>Total Amount :</span>
              <span className="font-black">{tapal.amount || '—'}</span>
            </div>
            {tapal.type === 'Sale' && (
              <div className="flex justify-between text-[10px] font-bold border-t border-blue-900 pt-1 mt-1">
                <span>Balance Due :</span>
                <span className="font-black text-red-600">{tapal.amount || '—'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Signature Block ── */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="border-t border-blue-900 pt-2 mt-10">
            <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Driver's Signature</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-blue-900 pt-2 mt-10">
            <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Receiver's Signature</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-blue-900 pt-2 mt-10">
            <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-tapal-root, .printable-tapal-root * { visibility: visible; }
          .printable-tapal-root { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4 portrait; margin: 8mm; }
        }
      `}} />
    </div>
  );
});

PrintableTapal.displayName = 'PrintableTapal';
export default PrintableTapal;
