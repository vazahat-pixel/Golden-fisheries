import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { Sprout, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateHarvestSlipV2 = () => {
  const navigate = useNavigate();
  const { addHarvestSlip, harvestSlips } = useAdminStore();

  // Mock list of vehicles and drivers for the dropdowns
  const mockVehicles = ['KA-30-M-4321', 'KA-19-F-9876', 'MH-09-E-5544', 'KA-20-C-1122'];
  const mockDrivers = ['Ramesh Patil', 'Suresh Gowda', 'Anil Fernandez', 'Sunil Mendonca'];
  const mockFarmers = ['Appanna Gowda', 'Subhash Naik', 'Shekhar Karwar', 'Mohammad Ali', 'Devendra Kharvi'];

  // Automatically compute next TP Slip No
  const [tpNo, setTpNo] = useState('');
  useEffect(() => {
    const lastNo = harvestSlips.length > 0 
      ? Math.max(...harvestSlips.map(s => parseInt(s.tpNo) || 0)) 
      : 1000;
    setTpNo(String(lastNo + 1));
  }, [harvestSlips]);

  // Form Fields
  const [farmerName, setFarmerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [graderName, setGraderName] = useState('');

  // Table items
  const [items, setItems] = useState([
    { id: '1', hsnCode: '03069500', particulars: 'PRAWNS', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '' },
    { id: '2', hsnCode: '03028400', particulars: 'SEABASS', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '' }
  ]);

  // Bottom notes & settings
  const [notes, setNotes] = useState('BLACK GILL SECOND QUALITY ( EXP )');
  const [damageNotes, setDamageNotes] = useState('THIRD QUALITY DAMAGE MATERIALS & DIO COMPLAINT');
  const [iceRentDeducted, setIceRentDeducted] = useState(false);
  const [inWords, setInWords] = useState('');

  // Recalculate row total weight and totals automatically
  const handleItemChange = (id, field, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto calculate totalWeight if boxes and weight exist
          if (field === 'noOfBoxes' || field === 'boxWeight') {
            const boxes = parseFloat(field === 'noOfBoxes' ? value : item.noOfBoxes) || 0;
            const weight = parseFloat(field === 'boxWeight' ? value : item.boxWeight) || 0;
            updatedItem.totalWeight = boxes && weight ? String(boxes * weight) : '';
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItemRow = () => {
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, hsnCode: '', particulars: '', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '' }]);
  };

  const removeItemRow = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate totals
  const totalBoxes = items.reduce((sum, item) => sum + (parseInt(item.noOfBoxes) || 0), 0);
  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.totalWeight) || 0), 0);

  // Generate numbers to words helper for total weight/boxes
  useEffect(() => {
    if (totalWeight > 0) {
      setInWords(`${totalWeight} KILOGRAMS ONLY`);
    } else {
      setInWords('');
    }
  }, [totalWeight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save details to temporary state & pass to preview page
    const slipData = {
      tpNo,
      farmerName,
      date,
      vehicleNo,
      driverName,
      graderName,
      items: items.filter(item => item.particulars || item.hsnCode), // Filter out completely empty items
      totalBoxes,
      totalWeight,
      notes,
      damageNotes,
      iceRentDeducted,
      inWords,
      status: 'Pending Approval'
    };

    // Store in session storage so preview page can load it
    sessionStorage.setItem('current_harvest_slip_creation', JSON.stringify(slipData));
    navigate('/admin/procurement/harvest/preview');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/admin/procurement/harvest')} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Sprout className="text-brand-yellow" size={24} /> Create Harvest Slip
          </h1>
          <p className="text-text-secondary text-sm mt-1">Receive new shipment loads from farmers. All inputs are completely optional.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 md:p-8 space-y-8 shadow-sm">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slip Number */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">TP Slip No</label>
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

          {/* Farmer Selection */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Farmer Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={farmerName}
                onChange={e => setFarmerName(e.target.value)}
                placeholder="Type or select farmer"
                className="w-full bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                list="farmers-list"
              />
              <datalist id="farmers-list">
                {mockFarmers.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
          </div>

          {/* Vehicle No */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Vehicle Number</label>
            <input 
              type="text" 
              value={vehicleNo}
              onChange={e => setVehicleNo(e.target.value)}
              placeholder="Type or select vehicle"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              list="vehicles-list"
            />
            <datalist id="vehicles-list">
              {mockVehicles.map(v => <option key={v} value={v} />)}
            </datalist>
          </div>

          {/* Driver Name */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Driver Name</label>
            <input 
              type="text" 
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              placeholder="Type or select driver"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              list="drivers-list"
            />
            <datalist id="drivers-list">
              {mockDrivers.map(d => <option key={d} value={d} />)}
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

        {/* Dynamic Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Harvest Load Particulars</h3>
            <button
              type="button"
              onClick={addItemRow}
              className="text-[10px] font-black uppercase tracking-widest text-brand-yellow hover:text-brand-olive transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center">Sl No</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-36">HSN Code</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-48">Particulars</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Count</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Boxes</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Box Wt (kg)</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Total Wt (kg)</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3 text-xs font-black text-center text-text-secondary">{index + 1}</td>
                    
                    {/* HSN CODE */}
                    <td className="py-3 px-3">
                      <input 
                        type="text" 
                        value={item.hsnCode} 
                        onChange={e => handleItemChange(item.id, 'hsnCode', e.target.value)}
                        placeholder="HSN"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    {/* Particulars */}
                    <td className="py-3 px-3">
                      <input 
                        type="text" 
                        value={item.particulars} 
                        onChange={e => handleItemChange(item.id, 'particulars', e.target.value)}
                        placeholder="Particulars"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                        list="particulars-presets"
                      />
                      <datalist id="particulars-presets">
                        <option value="PRAWNS" />
                        <option value="SEABASS" />
                        <option value="TUNA" />
                        <option value="CRABS" />
                        <option value="MACKEREL" />
                      </datalist>
                    </td>

                    {/* Count */}
                    <td className="py-3 px-3">
                      <input 
                        type="number" 
                        value={item.count} 
                        onChange={e => handleItemChange(item.id, 'count', e.target.value)}
                        placeholder="Count"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    {/* No of boxes */}
                    <td className="py-3 px-3">
                      <input 
                        type="number" 
                        value={item.noOfBoxes} 
                        onChange={e => handleItemChange(item.id, 'noOfBoxes', e.target.value)}
                        placeholder="Boxes"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    {/* Box Weight */}
                    <td className="py-3 px-3">
                      <input 
                        type="number" 
                        step="any"
                        value={item.boxWeight} 
                        onChange={e => handleItemChange(item.id, 'boxWeight', e.target.value)}
                        placeholder="Box Wt"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    {/* Total Weight */}
                    <td className="py-3 px-3">
                      <input 
                        type="number" 
                        step="any"
                        value={item.totalWeight} 
                        onChange={e => handleItemChange(item.id, 'totalWeight', e.target.value)}
                        placeholder="Total Wt"
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
                      />
                    </td>

                    {/* Remove Action */}
                    <td className="py-3 px-3 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-card-border pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1">Deduction & Notes</h3>
            
            {/* Ice and Vehicle Deduction */}
            <div className="flex items-center justify-between p-3 bg-[#F5F5EC]/30 border border-card-border">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-brand-olive tracking-wider">Ice & Vehicle Rent Deduction</p>
                <p className="text-[9px] text-text-muted mt-0.5">Toggle rent and ice cost adjustments.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={iceRentDeducted} 
                  onChange={e => setIceRentDeducted(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Note 1 */}
            <div className="flex flex-col">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">Receipt Quality Notes</label>
              <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              />
            </div>

            {/* Note 2 */}
            <div className="flex flex-col">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">Materials Quality Notes</label>
              <input 
                type="text" 
                value={damageNotes}
                onChange={e => setDamageNotes(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1">Load Totals</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-card-border text-center">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Boxes</p>
                <p className="text-2xl font-black text-brand-olive mt-1">{totalBoxes}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-card-border text-center">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Weight</p>
                <p className="text-2xl font-black text-brand-olive mt-1">{totalWeight.toFixed(2)} kg</p>
              </div>
            </div>

            {/* In Words */}
            <div className="flex flex-col">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">Total Weight (In Words)</label>
              <input 
                type="text" 
                value={inWords}
                onChange={e => setInWords(e.target.value)}
                placeholder="Calculated Weight in words"
                className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-card-border pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/procurement/harvest')}
            className="border border-card-border text-text-secondary px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#6A7051] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-md active:translate-y-0.5"
          >
            Generate Slip <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHarvestSlipV2;
