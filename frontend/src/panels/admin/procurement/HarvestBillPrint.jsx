import React, { useRef } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

function numberToWords(num) {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (!num || num === 0) return 'Zero';
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num/10)] + (num%10 ? ' '+a[num%10] : '');
  if (num < 1000) return a[Math.floor(num/100)]+' Hundred'+(num%100 ? ' '+numberToWords(num%100) : '');
  if (num < 100000) return numberToWords(Math.floor(num/1000))+' Thousand'+(num%1000 ? ' '+numberToWords(num%1000) : '');
  return num.toString();
}

/**
 * HarvestBillPrint
 * Props: slip (harvest slip data), onBack (fn)
 * Renders the exact M.K. Fisheries HARVEST SLIP format from Image 1.
 */
const HarvestBillPrint = ({ slip, onBack }) => {
  const printRef = useRef();

  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = 210;
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`HarvestSlip-${slip?.id || Date.now()}.pdf`);
      toast.success('Harvest Slip downloaded!');
    } catch {
      toast.error('PDF generation failed.');
    }
  };

  const today = new Date().toLocaleDateString('en-IN');
  const products = slip?.products || [
    { hsn: '03069500', name: 'PRAWNS', count: '', boxes: '', boxWeight: '', totalWeight: '' },
    { hsn: '03028400', name: 'SEABASS', count: '', boxes: '', boxWeight: '', totalWeight: '' },
  ];
  const totalWeight = products.reduce((s, p) => s + (parseFloat(p.totalWeight || p.quantity) || 0), 0);
  const farmerName = slip?.farmerId?.fullName || slip?.farmerName || '';
  const farmerCity = slip?.city || '';
  const farmerPhone = slip?.farmerId?.phone || slip?.farmer?.mobile || '';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black">
          <ArrowLeft size={14} /> Back to Slip
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 shadow-sm">
            <Printer size={13} /> Print
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#6B7550] text-white rounded-xl text-[10px] font-black uppercase hover:bg-[#5a6340] shadow-md">
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      {/* Bill — exact Image 1 format */}
      <div ref={printRef} className="bg-white border border-gray-400 mx-auto"
        style={{ maxWidth: '700px', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '10px 16px', borderBottom: '2px solid #333' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '1px' }}>M. K. FISHERIES</div>
          <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>WHOLE SALE FISH MERCHANTS</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>KARWAR &amp; MANGALORE (KARNATAKA)</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>Mob : 9019411439, 9663655558</div>
          <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '6px', letterSpacing: '3px', textDecoration: 'underline' }}>
            HARVEST SLIP
          </div>
        </div>

        {/* Customer + Slip Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #555' }}>
          <div style={{ padding: '8px 12px', borderRight: '1px solid #555' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Customer Details :</div>
            <div style={{ marginBottom: '4px' }}>NAME : <strong>{farmerName}</strong></div>
            <div style={{ marginBottom: '4px' }}>CITY : <strong>{farmerCity}</strong></div>
            <div>MOB NUMBER : <strong>{farmerPhone}</strong></div>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', lineHeight: '1.8' }}>
              <div><strong>H NO :</strong></div><div style={{ color: '#555', fontStyle: 'italic' }}>NUMERICS</div>
              <div><strong>Date :</strong></div><div><strong>{today}</strong></div>
              <div><strong>Vehicle No :</strong></div><div><strong>{slip?.vehicleNumber || 'DROP DOWN'}</strong></div>
              <div><strong>Driver Name :</strong></div><div><strong>{slip?.driverName || 'DROP DOWN'}</strong></div>
              <div><strong>Grader Name :</strong></div><div style={{ color: '#555', fontStyle: 'italic' }}>DROP DOWN</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              {['SI No', 'Hsn Code', 'Particulars', 'Count', 'NO OF BOXES', 'Box Weight', 'Total Weight', 'Rate', 'Total Amount'].map(h => (
                <th key={h} style={{ border: '1px solid #888', padding: '6px 4px', textAlign: 'center', fontWeight: 700, fontSize: '10px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const qty = parseFloat(p.totalWeight || p.quantity || p.estimatedQty) || 0;
              const rate = parseFloat(p.rate) || 0;
              const lineTotal = qty * rate;
              return (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.hsn || p.hsnCode || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 700 }}>{p.name || p.fishName || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.count || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.boxes || p.boxCount || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.boxWeight || p.weightPerBox || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', fontWeight: 700 }}>{qty || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{rate || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{lineTotal ? lineTotal.toFixed(2) : ''}</td>
                </tr>
              );
            })}
            {/* Extra blank rows */}
            {Array.from({ length: Math.max(0, 5 - products.length) }).map((_, i) => (
              <tr key={`e-${i}`} style={{ height: '26px' }}>
                {Array(9).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ddd' }}></td>)}
              </tr>
            ))}
            {/* Total Row */}
            <tr style={{ fontWeight: 700, background: '#f5f5f5' }}>
              <td colSpan={4} style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'right', fontWeight: 900 }}></td>
              <td style={{ border: '1px solid #888', padding: '6px', textAlign: 'center' }}>
                {products.reduce((sum, p) => sum + (parseInt(p.boxes || p.boxCount) || 0), 0) || '0'}
              </td>
              <td style={{ border: '1px solid #888', padding: '6px' }}></td>
              <td style={{ border: '1px solid #888', padding: '6px', textAlign: 'center', fontWeight: 900 }}>
                {products.reduce((sum, p) => sum + (parseFloat(p.totalWeight || p.quantity || p.estimatedQty) || 0), 0) || '0'}
              </td>
              <td style={{ border: '1px solid #888', padding: '6px' }}></td>
              <td style={{ border: '1px solid #888', padding: '6px', textAlign: 'right', fontWeight: 900 }}>
                {products.reduce((sum, p) => sum + ((parseFloat(p.totalWeight || p.quantity || p.estimatedQty) || 0) * (parseFloat(p.rate) || 0)), 0).toFixed(2) || '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notes & Deductions */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', borderBottom: '1px solid #bbb', fontSize: '10px' }}>
          {/* Left: Notes */}
          <div style={{ background: '#eef2e6', padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              NOTES ( BLACK GILL SECOND QUALITY ) ( EXP )
            </div>
            <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              THIRD QUALITY DAMAGE METERIALS &amp; DIO COMPLAINT
            </div>
            <div style={{ padding: '6px', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c00', fontWeight: 700 }}>
              ICE &amp; VEHICLE RENT NOT DEDUCTED
            </div>
          </div>
          {/* Right: Deductions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TDS @ 194Q</div>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb' }}>{slip?.tds || ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>COMISSION</div>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb' }}>{slip?.commission || ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SOFT</div>
              <div style={{ padding: '6px', borderBottom: '1px solid #bbb' }}>{slip?.soft || ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, background: '#f5f5f5' }}>
              <div style={{ padding: '6px', borderRight: '1px solid #bbb', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Grand Total</div>
              <div style={{ padding: '6px', fontWeight: 900, textAlign: 'right' }}>
                {(() => {
                  const subTotal = products.reduce((sum, p) => sum + ((parseFloat(p.totalWeight || p.quantity || p.estimatedQty) || 0) * (parseFloat(p.rate) || 0)), 0);
                  const tds = parseFloat(slip?.tds) || 0;
                  const comm = parseFloat(slip?.commission) || 0;
                  const soft = parseFloat(slip?.soft) || 0;
                  return (subTotal - tds - comm - soft).toFixed(2);
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* In Words + Auth */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #bbb', padding: '10px 12px' }}>
          <div>
            <strong>(in words)</strong>&nbsp;
            {totalWeight ? numberToWords(Math.round(totalWeight)) + ' Kilograms Only' : ''}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>For : M.K. FISHERIES</div>
            <div style={{ marginTop: '28px', fontSize: '10px', color: '#555' }}>Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvestBillPrint;
