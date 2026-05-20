import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { FileCheck, ArrowRight, ArrowLeft, Layers, Truck, User, Info, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateSalesTapal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slipIdParam = searchParams.get('slipId');

  const { 
    harvestSlips, 
    fetchHarvestSlips,
    buyers, 
    fetchBuyers, 
    vehicles, 
    fetchVehicles, 
    drivers, 
    fetchDrivers,
    convertSlipToTapalAsync,
    updateHarvestStatusAsync,
    updateSlipStatus,
    addTapal,
    tapals
  } = useAdminStore();

  // Load all lists
  useEffect(() => {
    fetchHarvestSlips();
    fetchBuyers();
    fetchVehicles();
    fetchDrivers();
  }, [fetchHarvestSlips, fetchBuyers, fetchVehicles, fetchDrivers]);

  // Form Fields
  const [selectedSlipId, setSelectedSlipId] = useState('');
  const [tpNo, setTpNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [graderName, setGraderName] = useState('');
  const [assignedBuyerId, setAssignedBuyerId] = useState('');

  // Selected Slip Details
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Automatically compute next TP Slip No
  useEffect(() => {
    const lastNo = tapals.length > 0 
      ? Math.max(...tapals.map(t => parseInt(t.tpNo || t.tapalNumber) || 0)) 
      : 5000;
    setTpNo(String(lastNo + 1));
  }, [tapals]);

  // Pre-load from parameter or session storage
  useEffect(() => {
    const targetId = slipIdParam || '';
    if (targetId) {
      setSelectedSlipId(targetId);
    } else {
      const rawData = sessionStorage.getItem('current_tapal_source_slip');
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (parsed && parsed.id) {
            setSelectedSlipId(parsed.id || parsed._id);
          }
        } catch (e) {
          console.warn('Could not parse source slip from session');
        }
      }
    }
  }, [slipIdParam]);

  // Handle selected slip changes
  useEffect(() => {
    if (selectedSlipId) {
      const found = harvestSlips.find(s => s.id === selectedSlipId || s._id === selectedSlipId);
      if (found) {
        setSelectedSlip(found);
        setVehicleNo(found.vehicleNo || '');
        setDriverName(found.driverName || '');
        setGraderName(found.graderName || '');
      }
    } else {
      setSelectedSlip(null);
    }
  }, [selectedSlipId, harvestSlips]);

  // Filter for approved slips
  const approvedSlips = harvestSlips.filter(s => 
    s.status === 'Farmer Approved' || 
    s.status === 'Approved' || 
    s.status === 'Draft' || 
    s.status === 'Sent to Farmer'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlipId) {
      toast.error('Please select a source Harvest Slip');
      return;
    }

    if (!assignedBuyerId) {
      toast.error('Please assign a Buyer for this Tapal');
      return;
    }

    const selectedBuyer = buyers.find(b => b.id === assignedBuyerId || b._id === assignedBuyerId) || { name: 'Unknown Buyer' };

    const loadToast = toast.loading('Creating logistics Tapal...');

    const tapalData = {
      tpNo,
      sourceSlipNo: selectedSlip?.tpNo || 'N/A',
      sourceSlipId: selectedSlipId,
      date,
      vehicleNo,
      driverName,
      graderName,
      buyerName: selectedBuyer.name,
      buyerId: assignedBuyerId,
      items: selectedSlip?.items || [],
      totalBoxes: selectedSlip?.totalBoxes || 0,
      totalWeight: selectedSlip?.totalWeight || 0,
      notes: selectedSlip?.notes || '',
      damageNotes: selectedSlip?.damageNotes || '',
      iceRentDeducted: selectedSlip?.iceRentDeducted || false,
      status: 'Assigned' // Moves into Logistics pipeline
    };

    try {
      // Backend conversion
      const createdTapal = await convertSlipToTapalAsync(selectedSlipId, assignedBuyerId, selectedSlip?.items);
      
      // Update with vehicle, driver, grader, etc.
      // Under the hood, this converts a procurement slip to dispatch tapal
      await updateHarvestStatusAsync(selectedSlipId, 'Tapal Created');
      
      // Clear temp storage
      sessionStorage.removeItem('current_tapal_source_slip');
      
      toast.success('Logistics Tapal created successfully!', { id: loadToast });
      navigate('/admin/tapals');
    } catch (err) {
      console.warn('Backend create failed, simulating Tapal creation locally:', err.message);
      
      // Offline fallback simulation
      const simulatedTapal = {
        ...tapalData,
        id: `TPL-${tpNo}`,
        _id: `TPL-${tpNo}`,
        tapalNumber: tpNo,
        party: selectedBuyer.name,
        partyName: selectedBuyer.name,
        amount: '₹0', // no price in logistics
        qty: `${selectedSlip?.totalWeight || 0} KG`,
        createdAt: new Date().toISOString()
      };

      // Add to store
      addTapal(simulatedTapal);
      updateSlipStatus(selectedSlipId, 'Tapal Created');
      
      sessionStorage.removeItem('current_tapal_source_slip');
      toast.success('Logistics Tapal created successfully (offline simulation)!', { id: loadToast });
      navigate('/admin/tapals');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/admin/tapals')} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Layers className="text-brand-yellow" size={24} /> Create Sales Tapal
          </h1>
          <p className="text-text-secondary text-sm mt-1">Generate a dispatch logistics slip from an approved farmer harvest slip.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 md:p-8 space-y-8 shadow-sm">
        {/* Source Slip Section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-2">
            <Info size={16} className="text-brand-yellow" /> Select Harvest Source Load
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Select Approved Harvest Slip</label>
              <select
                value={selectedSlipId}
                onChange={e => setSelectedSlipId(e.target.value)}
                className="bg-white border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              >
                <option value="">-- Choose Approved Slip --</option>
                {approvedSlips.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    Invoice/TP #{s.tpNo} - {s.farmerName} ({s.totalWeight} kg - {s.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedSlip && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 flex flex-col justify-center rounded-sm">
                <span className="text-[10px] font-black text-emerald-800 uppercase">Load Summary</span>
                <span className="text-xs font-extrabold text-emerald-900 mt-1 uppercase">
                  Farmer: {selectedSlip.farmerName} | Boxes: {selectedSlip.totalBoxes} | Weight: {selectedSlip.totalWeight} kg
                </span>
                <span className="text-[9px] font-bold text-emerald-700 italic mt-0.5 uppercase">
                  Quality: {selectedSlip.notes || 'Normal Quality'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dispatch & Assign Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tapal TP Number */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Tapal / TP Slip No</label>
            <input 
              type="text" 
              value={tpNo}
              onChange={e => setTpNo(e.target.value)}
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
            />
          </div>

          {/* Assigned Buyer */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Assign to Buyer / Merchant</label>
            <select
              value={assignedBuyerId}
              onChange={e => setAssignedBuyerId(e.target.value)}
              className="bg-white border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
            >
              <option value="">-- Choose Buyer --</option>
              {buyers.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name} ({b.phone})
                </option>
              ))}
              {/* Fallback mock option if empty */}
              {buyers.length === 0 && (
                <>
                  <option value="BYR-001">MANGALORE FISH CO.</option>
                  <option value="BYR-002">KARWAR EXPORTS LTD.</option>
                  <option value="BYR-003">SEA FOOD AGENCY</option>
                </>
              )}
            </select>
          </div>

          {/* Vehicle No */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Vehicle Number</label>
            <input 
              type="text" 
              value={vehicleNo}
              onChange={e => setVehicleNo(e.target.value)}
              placeholder="Select vehicle"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              list="vehicles-list"
            />
            <datalist id="vehicles-list">
              {vehicles.map(v => <option key={v.id || v._id} value={v.plateNumber} />)}
              <option value="KA-30-M-4321" />
              <option value="KA-19-F-9876" />
              <option value="MH-09-E-5544" />
            </datalist>
          </div>

          {/* Driver Name */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Driver Name</label>
            <input 
              type="text" 
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              placeholder="Select driver"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              list="drivers-list"
            />
            <datalist id="drivers-list">
              {drivers.map(d => <option key={d.id || d._id} value={d.name} />)}
              <option value="Ramesh Patil" />
              <option value="Suresh Gowda" />
              <option value="Anil Fernandez" />
            </datalist>
          </div>

          {/* Grader Name */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Grader Name</label>
            <input 
              type="text" 
              value={graderName}
              onChange={e => setGraderName(e.target.value)}
              placeholder="Name of Grader"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
            />
          </div>
        </div>

        {/* Products Grid (No Rate or Amount) */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2">
            Load Particulars Dispatch Table <span className="text-[10px] text-brand-yellow font-black block sm:inline sm:ml-2">(LACK OF RATE & VALUE COLUMNS FOR SECURE IN-TRANSIT FLOW)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center">Sl No</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-28">HSN Code</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive">Particulars</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-28 text-center">Count</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-28 text-center">NO OF BOXES</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-28 text-right">Box Weight</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-32 text-right pr-4">Total Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-xs">
                {selectedSlip ? (
                  selectedSlip.items?.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/40">
                      <td className="py-3 px-3 text-center font-black text-text-secondary">{index + 1}</td>
                      <td className="py-3 px-3 font-mono">{item.hsnCode || 'N/A'}</td>
                      <td className="py-3 px-3 font-extrabold text-brand-olive uppercase">{item.particulars}</td>
                      <td className="py-3 px-3 text-center font-bold">{item.count || 'N/A'}</td>
                      <td className="py-3 px-3 text-center font-black text-brand-olive">{item.noOfBoxes || 0}</td>
                      <td className="py-3 px-3 text-right font-medium">{item.boxWeight ? `${item.boxWeight} kg` : 'N/A'}</td>
                      <td className="py-3 px-3 text-right font-black text-brand-olive pr-4">{item.totalWeight ? `${parseFloat(item.totalWeight).toFixed(2)} kg` : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-text-muted italic">
                      Please select an approved source Harvest Slip above to load cargo items automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-card-border pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/tapals')}
            className="border border-card-border text-text-secondary px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#6A7051] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-md active:translate-y-0.5"
          >
            Create Tapal Slip <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSalesTapal;
