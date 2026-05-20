import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { Sprout, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateHarvestSlipV2 = () => {
  const navigate = useNavigate();
  const { addHarvestSlip, harvestSlips } = useAdminStore();
  const { user } = useAuthStore();
  const isOperator = user?.role === 'HARVEST_OPERATOR';

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
  const [city, setCity] = useState('');
  const [mobNumber, setMobNumber] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [graderName, setGraderName] = useState('');

  // Table items
  const [items, setItems] = useState([
    { id: '1', hsnCode: '03069500', particulars: 'PRAWNS', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '', rate: '', totalAmount: '' },
    { id: '2', hsnCode: '03069500', particulars: 'PRAWNS', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '', rate: '', totalAmount: '' }
  ]);

  // Bottom notes & settings
  const [notes, setNotes] = useState('');
  const [damageNotes, setDamageNotes] = useState('');
  const [iceRentDeducted, setIceRentDeducted] = useState(false);
  const [tds, setTds] = useState('');
  const [commission, setCommission] = useState('');
  const [soft, setSoft] = useState('');
  const [inWords, setInWords] = useState('');

  // Recalculate row total weight and totals automatically
  const handleItemChange = (id, field, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto calculate totalWeight and totalAmount
          const boxes = parseFloat(field === 'noOfBoxes' ? value : item.noOfBoxes) || 0;
          const weight = parseFloat(field === 'boxWeight' ? value : item.boxWeight) || 0;
          const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
          
          if (boxes && weight) {
            updatedItem.totalWeight = (boxes * weight).toFixed(2);
          } else {
            updatedItem.totalWeight = (parseFloat(field === 'totalWeight' ? value : item.totalWeight) || 0).toFixed(2) || '';
          }
          
          const finalTotalWeight = parseFloat(updatedItem.totalWeight) || 0;
          if (finalTotalWeight && rate) {
            updatedItem.totalAmount = (finalTotalWeight * rate).toFixed(2);
          } else if (!rate) {
            updatedItem.totalAmount = '';
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItemRow = () => {
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, hsnCode: '', particulars: '', count: '', noOfBoxes: '', boxWeight: '', totalWeight: '', rate: '', totalAmount: '' }]);
  };

  const removeItemRow = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate totals
  const totalBoxes = items.reduce((sum, item) => sum + (parseInt(item.noOfBoxes) || 0), 0);
  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.totalWeight) || 0), 0);
  const totalItemsAmount = items.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
  
  const parsedTds = parseFloat(tds) || 0;
  const parsedCommission = parseFloat(commission) || 0;
  const parsedSoft = parseFloat(soft) || 0;
  const grandTotal = totalItemsAmount - parsedTds - parsedCommission - parsedSoft;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save details to temporary state & pass to preview page
    const slipData = {
      tpNo,
      farmerName,
      city,
      mobNumber,
      farmerPhone: mobNumber,
      date,
      vehicleNo,
      driverName,
      graderName,
      items: items.filter(item => item.particulars || item.hsnCode), // Filter out completely empty items
      totalBoxes,
      totalWeight,
      totalItemsAmount,
      tds,
      commission,
      soft,
      grandTotal,
      notes,
      damageNotes,
      iceRentDeducted,
      inWords,
      status: 'Draft' // Start as draft per Phase 1.3 requirements
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
          <p className="text-text-secondary text-sm mt-1">Receive new shipment loads from farmers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 md:p-8 space-y-8 shadow-sm">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Slip Number */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Invoice No / TP No</label>
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
          
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">City</label>
            <input 
              type="text" 
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="City"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Mob Number</label>
            <input 
              type="text" 
              value={mobNumber}
              onChange={e => setMobNumber(e.target.value)}
              placeholder="Mob Number"
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
            />
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
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center">Sl No</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">HSN Code</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-36">Particulars</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-20">Count</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-20">NO OF BOXES</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-20">Box Weight</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Total Weight</th>
                  {!isOperator && <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-20">Rate</th>}
                  {!isOperator && <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-24">Total Amount</th>}
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="py-2 px-2 text-xs font-black text-center text-text-secondary">{index + 1}</td>
                    
                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={item.hsnCode} 
                        onChange={e => handleItemChange(item.id, 'hsnCode', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={item.particulars} 
                        onChange={e => handleItemChange(item.id, 'particulars', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={item.count} 
                        onChange={e => handleItemChange(item.id, 'count', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input 
                        type="number" 
                        value={item.noOfBoxes} 
                        onChange={e => handleItemChange(item.id, 'noOfBoxes', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input 
                        type="number" 
                        step="any"
                        value={item.boxWeight} 
                        onChange={e => handleItemChange(item.id, 'boxWeight', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input 
                        type="number" 
                        step="any"
                        value={item.totalWeight} 
                        onChange={e => handleItemChange(item.id, 'totalWeight', e.target.value)}
                        className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
                      />
                    </td>
                    
                    {!isOperator && (
                      <td className="py-2 px-2">
                        <input 
                          type="number" 
                          step="any"
                          value={item.rate} 
                          onChange={e => handleItemChange(item.id, 'rate', e.target.value)}
                          className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                        />
                      </td>
                    )}
                    
                    {!isOperator && (
                      <td className="py-2 px-2">
                        <input 
                          type="number" 
                          step="any"
                          value={item.totalAmount} 
                          onChange={e => handleItemChange(item.id, 'totalAmount', e.target.value)}
                          className="w-full bg-[#F5F5EC]/20 border border-card-border px-2 py-1.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold text-brand-olive"
                        />
                      </td>
                    )}

                    <td className="py-2 px-2 text-center">
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

        {/* Deductions & Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-card-border pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1">Deduction & Notes</h3>
            
            {/* Notes Section matching UI */}
            <div className="flex flex-col">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">NOTES ( BLACK GILL SECOND QUALITY ) ( EXP )</label>
              <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">THIRD QUALITY DAMAGE MATERIALS & DIO COMPLAINT</label>
              <input 
                type="text" 
                value={damageNotes}
                onChange={e => setDamageNotes(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-200">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-red-600 tracking-wider">ICE & VEHICLE RENT DEDUCTED</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={iceRentDeducted} 
                  onChange={e => setIceRentDeducted(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            
            {/* In Words */}
            {!isOperator && (
              <div className="flex flex-col pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">(in words)</label>
                <input 
                  type="text" 
                  value={inWords}
                  onChange={e => setInWords(e.target.value)}
                  placeholder="Amount in words"
                  className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isOperator ? (
              <>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1">Load Totals</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-slate-50 border border-card-border text-center">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Boxes</p>
                    <p className="text-2xl font-black text-brand-olive mt-1">{totalBoxes}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-card-border text-center">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Weight</p>
                    <p className="text-2xl font-black text-brand-olive mt-1">{totalWeight.toFixed(2)} KG</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1">Load Totals & Calculations</h3>
                
                <div className="flex flex-col">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">TDS @ 194Q</label>
                  <input 
                    type="number" 
                    value={tds}
                    onChange={e => setTds(e.target.value)}
                    className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">COMISSION</label>
                  <input 
                    type="number" 
                    value={commission}
                    onChange={e => setCommission(e.target.value)}
                    className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-olive mb-1">SOFT</label>
                  <input 
                    type="number" 
                    value={soft}
                    onChange={e => setSoft(e.target.value)}
                    className="bg-[#F5F5EC]/40 border border-card-border px-3 py-2 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-card-border">
                  <div className="p-4 bg-slate-50 border border-card-border text-center">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Boxes</p>
                    <p className="text-2xl font-black text-brand-olive mt-1">{totalBoxes}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-card-border text-center">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Grand Total</p>
                    <p className="text-2xl font-black text-brand-olive mt-1">₹{grandTotal.toFixed(2)}</p>
                  </div>
                </div>
              </>
            )}
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
