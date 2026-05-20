import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { Layers, FileText, CheckCircle, Truck, Search, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TapalList = () => {
  const navigate = useNavigate();
  const { tapals, fetchTapals, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTapals();
  }, [fetchTapals]);

  const filteredTapals = tapals.filter(t => {
    const matchesSearch = (t.tpNo || t.tapalNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.party || t.partyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || t.status?.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Layers className="text-brand-yellow" size={24} /> Tapals Registry
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage dispatch and logistics slips.</p>
        </div>
        <button
          onClick={() => navigate('/admin/tapals/create')}
          className="bg-brand-olive text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> New Tapal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-sm w-fit border border-card-border">
          {['ALL', 'CREATED', 'ASSIGNED', 'IN TRANSIT', 'DELIVERED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${
                filter === f ? 'bg-white shadow-sm text-brand-olive' : 'text-text-secondary hover:text-brand-olive'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Tapals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-card-border px-10 py-2.5 text-xs focus:ring-1 focus:ring-brand-olive outline-none"
          />
          <Search size={14} className="absolute left-4 top-3 text-text-muted" />
        </div>
      </div>

      <div className="bg-white border border-card-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">TP No</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Date</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Buyer / Party</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Source Slip</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Status</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">Loading Tapals...</td>
                </tr>
              ) : filteredTapals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted italic">No tapals found.</td>
                </tr>
              ) : (
                filteredTapals.map((tapal) => (
                  <tr key={tapal.id || tapal._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-black text-brand-olive">#{tapal.tpNo || tapal.tapalNumber}</td>
                    <td className="py-4 px-4 font-medium text-text-secondary">
                      {new Date(tapal.createdAt || tapal.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-extrabold uppercase">{tapal.buyerName || tapal.party || tapal.partyName || 'Unknown'}</td>
                    <td className="py-4 px-4 font-medium text-text-secondary">{tapal.sourceSlipNo || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm ${
                        tapal.status?.toUpperCase() === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        tapal.status?.toUpperCase() === 'IN TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        tapal.status?.toUpperCase() === 'ASSIGNED' ? 'bg-brand-yellow/30 text-brand-olive' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tapal.status || 'CREATED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/tapals/${tapal.id || tapal._id}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-olive hover:text-brand-yellow transition-colors"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TapalList;
