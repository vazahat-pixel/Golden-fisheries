import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-hot-toast';

// Converts a number to Indian words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  return num.toString();
}

const BuyerBillView = () => {
  const { tapalId } = useParams();
  const navigate = useNavigate();
  const { trips, fetchTrips } = useAdminStore();
  const printRef = useRef();

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const trip = trips.find(t => t.id === tapalId || t._id === tapalId || t.tripNumber === tapalId);

  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Tapal-${trip?.tripNumber || tapalId}.pdf`);
      toast.success('Tapal bill downloaded!');
    } catch (err) {
      toast.error('PDF generation failed. Try again.');
    }
  };

  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString('en-IN');
  const items = trip?.products || [
    { hsn: '03069500', name: 'PRAWNS', count: '', boxes: '', boxWeight: '', totalWeight: '' },
    { hsn: '03028400', name: 'SEABASS', count: '', boxes: '', boxWeight: '', totalWeight: '' },
  ];

  const totalWeight = items.reduce((sum, i) => sum + (parseFloat(i.totalWeight) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm">
            <Printer size={13} /> Print
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md">
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Bill — M.K. Fisheries TAPAL format */}
      <div ref={printRef} className="bg-white border border-slate-300 mx-auto"
        style={{ maxWidth: '700px', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '2px solid #333' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '1px' }}>M. K. FISHERIES</div>
          <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>WHOLE SALE FISH MERCHANTS</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>KARWAR &amp; MANGALORE (KARNATAKA)</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>Mob : 9019411439, 9663655558</div>
          <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '6px', letterSpacing: '3px', textDecoration: 'underline' }}>TAPAL</div>
        </div>

        {/* Customer + TP Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #333' }}>
          <div style={{ padding: '8px 12px', borderRight: '1px solid #333' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Customer Details :</div>
            <div>NAME : <strong>{trip?.buyerName || '___________________'}</strong></div>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div><strong>TP NO :</strong></div><div style={{ fontStyle: 'italic', color: '#555' }}>NUMERICS</div>
              <div><strong>Date :</strong></div><div><strong>{today}</strong></div>
              <div><strong>Vehicle No :</strong></div><div><strong>{trip?.vehicle || 'DROP DOWN'}</strong></div>
              <div><strong>Driver Name :</strong></div><div><strong>{trip?.driverName || 'DROP DOWN'}</strong></div>
              <div><strong>Grader Name :</strong></div><div style={{ fontStyle: 'italic', color: '#555' }}>DROP DOWN</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              {['SI No', 'Hsn Code', 'Particulars', 'Count', 'NO OF BOXES', 'Box Weight', 'Total Weight'].map(h => (
                <th key={h} style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center', fontWeight: 700, fontSize: '10px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center' }}>{item.hsn || item.hsnCode || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', fontWeight: 700 }}>{item.name || item.fishName || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center' }}>{item.count || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center' }}>{item.boxes || item.confirmedQty || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center' }}>{item.boxWeight || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{item.totalWeight || item.quantity || ''}</td>
              </tr>
            ))}
            {/* Empty rows */}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '28px' }}>
                {Array(7).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ccc' }}></td>)}
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ fontWeight: 700, background: '#f9f9f9' }}>
              <td colSpan={4} style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center', fontWeight: 900 }}>TOTAL</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center' }}>0</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center' }}></td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center', fontWeight: 900 }}>{totalWeight || 0}</td>
            </tr>
          </tbody>
        </table>

        {/* Notes */}
        <div style={{ padding: '6px 12px', borderTop: '1px solid #ccc', background: '#f9f9f9', fontSize: '10px' }}>
          <div>NOTES ( BLACK GILL SECOND QUALITY ) ( EXP )</div>
          <div style={{ marginTop: '4px' }}>THIRD QUALITY DAMAGE METERIALS &amp; DIO COMPLAINT</div>
          <div style={{ marginTop: '4px', color: '#c00', fontWeight: 700 }}>ICE &amp; VEHICLE RENT NOT DEDUCTED</div>
        </div>

        {/* In Words + Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #ccc', padding: '8px 12px' }}>
          <div>
            <span style={{ fontWeight: 700 }}>(in words) </span>
            <span>{totalWeight ? numberToWords(Math.round(totalWeight)) + ' Kilograms Only' : ''}</span>
          </div>
          <div style={{ textAlign: 'right', fontWeight: 700 }}>
            <div>For : M.K. FISHERIES</div>
            <div style={{ marginTop: '24px', fontSize: '10px', color: '#555' }}>Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerBillView;
