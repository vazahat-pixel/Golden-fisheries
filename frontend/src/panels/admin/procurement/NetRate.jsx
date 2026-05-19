import React, { useState } from 'react';
import { TrendingUp, Edit2, Save, Plus, Trash2, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';

const INITIAL_RATES = [
  { id: 1, species: 'PRAWNS', hsnCode: '03069500', buyRate: 280, unit: 'KG', grade: 'A' },
  { id: 2, species: 'SEABASS', hsnCode: '03028400', buyRate: 180, unit: 'KG', grade: 'A' },
  { id: 3, species: 'SQUID', hsnCode: '03074300', buyRate: 150, unit: 'KG', grade: 'A' },
  { id: 4, species: 'POMFRET', hsnCode: '03029900', buyRate: 420, unit: 'KG', grade: 'A' },
  { id: 5, species: 'SARDINE', hsnCode: '03024000', buyRate: 60, unit: 'KG', grade: 'B' },
  { id: 6, species: 'MACKEREL', hsnCode: '03025400', buyRate: 75, unit: 'KG', grade: 'B' },
];

const NetRate = () => {
  const [rates, setRates] = useState(INITIAL_RATES);
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleSave = (id) => {
    if (!editVal || isNaN(editVal)) return toast.error('Enter valid rate');
    setRates(prev => prev.map(r => r.id === id ? { ...r, buyRate: parseFloat(editVal) } : r));
    setEditId(null);
    setEditVal('');
    toast.success('Net rate updated');
  };

  const gradeColor = (g) => g === 'A' ? 'bg-emerald-50 text-emerald-600' : g === 'B' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#6B7550] mb-1">PROCUREMENT</p>
          <h1 className="text-2xl font-serif italic font-black text-black">
            Net Rate <span className="text-[#6B7550]">Board.</span>
          </h1>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">Daily purchase rates · Updated {today}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#6B7550]/10 border border-[#6B7550]/20 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-[#6B7550] rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7550]">LIVE RATES</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Species Tracked', value: rates.length },
          { label: 'Grade A Species', value: rates.filter(r => r.grade === 'A').length },
          { label: 'Avg Buy Rate', value: '₹' + Math.round(rates.reduce((s, r) => s + r.buyRate, 0) / rates.length) },
          { label: 'Last Updated', value: 'Today' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-card-border shadow-subtle p-4 rounded-xl">
            <p className="text-xl font-black font-serif italic text-black">{c.value}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-text-muted mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Rate Table */}
      <div className="bg-white border border-card-border shadow-subtle rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border bg-slate-50/40 flex justify-between items-center">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-text-muted">SPECIES NET RATES (₹ / KG)</h2>
          <span className="text-[8px] text-text-muted font-bold uppercase">Click rate to edit</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-olive-50/10 border-b border-card-border">
              {['#', 'Species', 'HSN Code', 'Grade', 'Buy Rate (₹/KG)', 'Action'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-widest text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {rates.map((r, i) => (
              <tr key={r.id} className="hover:bg-olive-50/10 transition-colors">
                <td className="px-5 py-3.5 text-[10px] font-bold text-text-muted">{i + 1}</td>
                <td className="px-5 py-3.5 text-[11px] font-black text-black uppercase tracking-tight">{r.species}</td>
                <td className="px-5 py-3.5 text-[10px] font-bold text-text-muted font-mono">{r.hsnCode}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                </td>
                <td className="px-5 py-3.5">
                  {editId === r.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">₹</span>
                      <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                        className="w-20 border border-[#6B7550] rounded-lg px-2 py-1 text-[11px] font-black outline-none focus:ring-2 focus:ring-[#6B7550]"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(r.id); if (e.key === 'Escape') setEditId(null); }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 cursor-pointer group" onClick={() => { setEditId(r.id); setEditVal(r.buyRate); }}>
                      <span className="text-[13px] font-black text-black group-hover:text-[#6B7550] transition-colors">₹{r.buyRate}</span>
                      <Edit2 size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {editId === r.id ? (
                    <button onClick={() => handleSave(r.id)}
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800">
                      <Save size={11} /> Save
                    </button>
                  ) : (
                    <button onClick={() => { setEditId(r.id); setEditVal(r.buyRate); }}
                      className="text-[9px] font-black uppercase tracking-widest text-[#6B7550] hover:text-black flex items-center gap-1">
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest text-center">
        Rates are used as defaults in Harvest Slip creation · Procurement Manager access only
      </p>
    </div>
  );
};

export default NetRate;
