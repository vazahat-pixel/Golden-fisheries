import React, { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BillBlock = ({ data, pumps, totalKms, total, balancePayable }) => {
  const { form } = data;
  const rows = [
    ['Driver Batta', form.driverBatta],
    ['RTO / PC / RMC', form.rtoPcRmc],
    ['Maintenance', form.maintenance],
    ['Toll / Fastag', form.tollFastag],
    ['Halting', form.halting],
    ['Diesel', form.diesel],
  ];

  const cell = { border: '1px solid #333', padding: '4px 8px', fontSize: '10px' };
  const hdr = { ...cell, fontWeight: 700, background: '#FFF176', fontSize: '10px' };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#000', padding: '12px', border: '1px solid #555', marginBottom: '16px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textDecoration: 'underline' }}>
        Driver &amp; Road Expenses
      </div>

      {/* Trip Info Grid */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
        <tbody>
          <tr>
            <td style={cell}><strong>Trip Start Date</strong></td>
            <td style={cell}>{form.tripStartDate}</td>
            <td style={cell}><strong>End Date</strong></td>
            <td style={cell}>{form.tripEndDate}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Vehicle Number</strong></td>
            <td style={cell}>{form.vehicleNumber}</td>
            <td style={cell}><strong>Driver Name</strong></td>
            <td style={cell}>{form.driverName}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Loading Point</strong></td>
            <td style={cell} colSpan={3}>{form.loadingPoint}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Unloading Point</strong></td>
            <td style={cell} colSpan={3}>{form.unloadingPoint}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Boxes / Tapal No.</strong></td>
            <td style={cell}>{form.tapalNo}</td>
            <td style={cell}><strong>Starting KMS</strong></td>
            <td style={cell}>{form.startingKms}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Driver Batta</strong></td>
            <td style={cell}>{form.driverBatta || '—'}</td>
            <td style={cell}><strong>Ending KMS</strong></td>
            <td style={cell}>{form.endingKms}</td>
          </tr>
          <tr>
            <td style={cell}><strong>RTO / PC / RMC</strong></td>
            <td style={cell}>{form.rtoPcRmc || '—'}</td>
            <td style={cell}><strong>Total KMS</strong></td>
            <td style={cell}><strong>{totalKms}</strong></td>
          </tr>
          <tr>
            <td style={cell}><strong>Maintenance</strong></td>
            <td style={cell}>{form.maintenance || '—'}</td>
            <td style={cell}><strong>Diesel</strong></td>
            <td style={cell}>{form.diesel || '—'}</td>
          </tr>
          <tr>
            <td style={cell}><strong>Toll / Fastag</strong></td>
            <td style={cell}>{form.tollFastag || '—'}</td>
            <td style={cell}><strong>Mileage</strong></td>
            <td style={cell}>{form.mileage || '—'} KM/L</td>
          </tr>
          <tr>
            <td style={cell}><strong>Halting</strong></td>
            <td style={cell}>{form.halting || '—'}</td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={{ ...cell, background: '#FFF176', fontWeight: 900 }}>Total</td>
            <td style={{ ...cell, background: '#FFF176', fontWeight: 900 }}>₹{total}</td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}><strong>Less Advance</strong></td>
            <td style={cell}>{form.lessAdvance || '0'}</td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={{ ...cell, fontWeight: 900 }}>Balance Payable</td>
            <td style={{ ...cell, fontWeight: 900 }}>₹{balancePayable}</td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
        </tbody>
      </table>

      {/* Pump Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0' }}>
        <thead>
          <tr>
            <th style={hdr}>Pump Name</th>
            <th style={hdr}>Ltrs</th>
            <th style={hdr}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(pumps || []).map((p, i) => (
            <tr key={i}>
              <td style={cell}>{p.name || ''}</td>
              <td style={cell}>{p.litres || ''}</td>
              <td style={cell}>{p.amount ? `₹${p.amount}` : ''}</td>
            </tr>
          ))}
          {(pumps || []).length < 3 && Array.from({ length: 3 - (pumps || []).length }).map((_, i) => (
            <tr key={`ep-${i}`} style={{ height: '22px' }}>
              <td style={cell}></td><td style={cell}></td><td style={cell}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0' }}>
        <tbody>
          <tr>
            <td style={{ ...hdr, textAlign: 'center' }} colSpan={3}>Remarks</td>
          </tr>
          <tr>
            <td style={{ ...cell, height: '40px', verticalAlign: 'top' }} colSpan={3}>{form.remarks || ''}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const DriverExpenseBillPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const printRef = useRef();

  const [dbData, setDbData] = React.useState(null);
  const [loading, setLoading] = React.useState(!location.state);

  React.useEffect(() => {
    if (!location.state && tripId) {
      setLoading(true);
      import('../../services/apiClient')
        .then(({ apiClient }) => {
          apiClient.get(`/tapals/trip/${tripId}`)
            .then(res => {
              const trip = res.data?.trip || res.data;
              if (trip && trip.postTripExpenses) {
                setDbData({
                  form: {
                    tripStartDate: trip.postTripExpenses.tripStartDate,
                    tripEndDate: trip.postTripExpenses.tripEndDate,
                    vehicleNumber: trip.postTripExpenses.vehicleNumber,
                    driverName: trip.postTripExpenses.driverName,
                    loadingPoint: trip.postTripExpenses.loadingPoint,
                    unloadingPoint: trip.postTripExpenses.unloadingPoint,
                    tapalNo: trip.postTripExpenses.tapalNo || trip.tripNumber,
                    driverBatta: trip.postTripExpenses.driverBatta,
                    rtoPcRmc: trip.postTripExpenses.rtoPcRmc,
                    maintenance: trip.postTripExpenses.maintenance,
                    tollFastag: trip.postTripExpenses.tollFastag,
                    halting: trip.postTripExpenses.halting,
                    startingKms: trip.postTripExpenses.startingKms,
                    endingKms: trip.postTripExpenses.endingKms,
                    diesel: trip.postTripExpenses.diesel,
                    mileage: trip.postTripExpenses.mileage,
                    lessAdvance: trip.postTripExpenses.lessAdvance,
                    remarks: trip.postTripExpenses.remarks
                  },
                  pumps: trip.postTripExpenses.pumps || [],
                  totalKms: trip.postTripExpenses.totalKms || 0,
                  total: trip.postTripExpenses.totalExpenses || 0,
                  balancePayable: trip.postTripExpenses.balancePayable || 0
                });
              } else {
                toast.error('Detailed post-trip expenses not found for this trip.');
              }
            })
            .catch(err => {
              console.error(err);
              toast.error('Failed to load trip expenses.');
            })
            .finally(() => setLoading(false));
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [location.state, tripId]);

  const state = location.state || dbData || {};
  const { form = {}, pumps = [], totalKms = 0, total = 0, balancePayable = 0 } = state;

  const data = { form };

  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#fff', useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = 210;
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`DriverExpense-${tripId || Date.now()}.pdf`);
      toast.success('Expense bill downloaded!');
    } catch {
      toast.error('PDF generation failed. Try print instead.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retrieving post-trip statement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-5 print:hidden">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-slate-50">
            <Printer size={13} /> Print
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#6B7550] text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-[#5a6340]">
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      {/* Two-copy layout as shown in Image 3 */}
      <div ref={printRef} className="max-w-lg mx-auto bg-white p-4">
        <BillBlock data={data} pumps={pumps} totalKms={totalKms} total={total} balancePayable={balancePayable} />
        {/* Divider line between the two copies */}
        <div style={{ borderTop: '2px dashed #999', margin: '8px 0', paddingTop: '4px', textAlign: 'center', fontSize: '9px', color: '#999', fontWeight: 700 }}>
          ✂ OFFICE COPY
        </div>
        <BillBlock data={data} pumps={pumps} totalKms={totalKms} total={total} balancePayable={balancePayable} />
      </div>
    </div>
  );
};

export default DriverExpenseBillPrint;
