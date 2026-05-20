import React from 'react';

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
 * PrintableTapal
 * Props: tapal (tapal data)
 * Renders the exact M.K. Fisheries TAPAL format based on the uploaded image.
 */
export const PrintableTapal = React.forwardRef(({ tapal }, ref) => {
  if (!tapal) return null;

  const today = tapal.createdAt
    ? new Date(tapal.createdAt).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  const products = tapal.products || [];
  
  // Try to find the linked Harvest if any, otherwise just use Tapal's products
  const linkedHarvest = tapal.harvestId || tapal.harvest;
  
  const totalWeight = products.reduce((sum, p) => {
    // If it's a raw string like "300 KG", parse it, otherwise use numeric qty
    const val = p.qty || p.numericQty || p.totalWeight || p.quantity || 0;
    const num = parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
    return sum + num;
  }, 0);

  const totalBoxes = products.reduce((sum, p) => {
    return sum + (parseInt(p.boxQty || p.boxes || p.boxCount) || 0);
  }, 0);

  const customerName = tapal.partyName || tapal.party || '—';
  const customerCity = tapal.city || '';
  const vehicleNo = tapal.vehicleNumber || tapal.vehicleNo || '—';
  const driverName = tapal.driver || tapal.driverName || '—';
  const graderName = tapal.graderName || linkedHarvest?.graderName || '—';
  const tpNo = tapal.tapalNumber || tapal.id?.replace(/\D/g, '') || '—';

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-400 mx-auto printable-tapal-root"
      style={{ maxWidth: '700px', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '10px 16px', borderBottom: '2px solid #333' }}>
        <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '1px', color: '#1e3a8a' }}>M. K. FISHERIES</div>
        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px', color: '#1e3a8a' }}>WHOLE SALE FISH MERCHANTS</div>
        <div style={{ fontSize: '10px', marginTop: '2px', color: '#1e3a8a' }}>KARWAR &amp; MANGALORE (KARNATAKA)</div>
        <div style={{ fontSize: '10px', marginTop: '2px', color: '#1e3a8a' }}>Mob : 9019411439, 9663655558</div>
        <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '6px', letterSpacing: '3px', color: '#1e3a8a', textDecoration: 'underline' }}>
          TAPAL
        </div>
      </div>

      {/* Customer + Slip Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #555' }}>
        <div style={{ padding: '8px 12px', borderRight: '1px solid #555' }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>Customer Details :</div>
          <div style={{ marginBottom: '4px' }}>NAME : <strong>{customerName}</strong></div>
          {customerCity && <div style={{ marginBottom: '4px' }}>CITY : <strong>{customerCity}</strong></div>}
        </div>
        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', lineHeight: '1.8' }}>
            <div><strong>TP NO :</strong></div><div><strong>{tpNo}</strong></div>
            <div><strong>Date :</strong></div><div><strong>{today}</strong></div>
            <div><strong>Vehicle No :</strong></div><div><strong>{vehicleNo}</strong></div>
            <div><strong>Driver Name :</strong></div><div><strong>{driverName}</strong></div>
            <div><strong>Grader Name :</strong></div><div><strong>{graderName}</strong></div>
          </div>
        </div>
      </div>

      {/* Items Table (No Rate/Total) */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            {['Sl No', 'Hsn Code', 'Particulars', 'Count', 'NO OF BOXES', 'Box Weight', 'Total Weight'].map(h => (
              <th key={h} style={{ border: '1px solid #888', padding: '6px 4px', textAlign: 'center', fontWeight: 700, fontSize: '10px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const val = p.qty || p.numericQty || p.totalWeight || p.quantity || 0;
            const qty = parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
            const boxes = parseInt(p.boxQty || p.boxes || p.boxCount) || '';
            const boxWt = parseFloat(p.weightPerBox || p.boxWeight) || '';
            
            return (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.hsn || p.hsnCode || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 700 }}>{p.name || p.fishName || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.count || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{boxes || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{boxWt || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', fontWeight: 700 }}>{qty || ''}</td>
              </tr>
            );
          })}
          {/* Extra blank rows to fill space */}
          {Array.from({ length: Math.max(0, 7 - products.length) }).map((_, i) => (
            <tr key={`e-${i}`} style={{ height: '26px' }}>
              {Array(7).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ddd' }}></td>)}
            </tr>
          ))}
          {/* Total Row */}
          <tr style={{ fontWeight: 700, background: '#f5f5f5' }}>
            <td colSpan={4} style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'right', fontWeight: 900 }}>TOTAL</td>
            <td style={{ border: '1px solid #888', padding: '6px', textAlign: 'center', fontWeight: 900 }}>
              {totalBoxes > 0 ? totalBoxes : '0'}
            </td>
            <td style={{ border: '1px solid #888', padding: '6px' }}></td>
            <td style={{ border: '1px solid #888', padding: '6px', textAlign: 'center', fontWeight: 900 }}>
              {totalWeight > 0 ? totalWeight : '0'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', borderBottom: '1px solid #bbb', fontSize: '10px' }}>
        <div style={{ background: '#eef2e6', padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            NOTES ( BLACK GILL SECOND QUALITY ) ( EXP ): {tapal?.deductionsNotes || linkedHarvest?.deductionsNotes || ''}
          </div>
          <div style={{ padding: '6px', borderBottom: '1px solid #bbb', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            THIRD QUALITY DAMAGE METERIALS &amp; DIO COMPLAINT: {tapal?.damageComplaint || linkedHarvest?.damageComplaint || ''}
          </div>
          <div style={{ padding: '6px', borderRight: '1px solid #bbb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c00', fontWeight: 700 }}>
            ICE &amp; VEHICLE RENT NOT DEDUCTED
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #bbb' }}>
           {/* Empty space next to notes as per image */}
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

      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-tapal-root, .printable-tapal-root * { visibility: visible; }
          .printable-tapal-root { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; margin: 0; border: none; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}} />
    </div>
  );
});

PrintableTapal.displayName = 'PrintableTapal';
export default PrintableTapal;
