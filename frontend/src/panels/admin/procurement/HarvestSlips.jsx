import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Sprout, Plus, Search, Calendar, Filter, ArrowRight, 
  CheckCircle, Clock, XCircle, ShoppingBag, Weight, Inbox, RefreshCw 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const HarvestSlips = () => {
  const navigate = useNavigate();
  const { harvestSlips, fetchHarvestSlips, loading } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHarvestSlips();
  }, [fetchHarvestSlips]);

  const activeSlips = harvestSlips || [];

  // Filter Logic
  const filteredSlips = activeSlips.filter(slip => {
    const matchesSearch = 
      (slip.farmerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slip.tpNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      slip.status?.toUpperCase().replace(' ', '_') === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate quick stats
  const statsTotalSlips = activeSlips.length;
  const statsPendingApprovals = activeSlips.filter(s => s.status === 'Pending Approval').length;
  const statsTotalWeight = activeSlips.reduce((sum, s) => sum + (parseFloat(s.totalWeight) || 0), 0);
  const statsTotalBoxes = activeSlips.reduce((sum, s) => sum + (parseInt(s.totalBoxes) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock size={12} /> Pending Approval
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            <FileText size={12} /> Draft
          </span>
        );
      case 'Sent to Farmer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
            <Inbox size={12} /> Sent to Farmer
          </span>
        );
      case 'Farmer Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={12} /> Farmer Approved
          </span>
        );
      case 'Tapal Created':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <FileCheck size={12} /> Tapal Created
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Sprout className="text-brand-yellow" size={24} /> Harvest Slips
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage and track Goods Received Notes (GRN) from shrimp and fish farmers.</p>
        </div>
        <button
          onClick={() => navigate('/admin/procurement/harvest/new')}
          className="bg-[#6A7051] text-white px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-md active:translate-y-0.5"
        >
          <Plus size={16} /> Create Harvest Slip
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Slips */}
        <div className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Total Received Slips</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{statsTotalSlips}</p>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Total Weight Inflow</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{statsTotalWeight.toLocaleString()} kg</p>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm">
            <Weight size={22} />
          </div>
        </div>

        {/* Total Boxes */}
        <div className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Total Boxes Received</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{statsTotalBoxes}</p>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm">
            <Inbox size={22} />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive font-bold">Pending Review</p>
            <p className="text-3xl font-black text-amber-600 mt-1.5">{statsPendingApprovals}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-sm">
            <Clock size={22} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-card-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 text-text-muted" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by farmer name or TP slip number..."
            className="w-full bg-[#F5F5EC]/40 border border-card-border pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-olive mr-2 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {['ALL', 'PENDING APPROVAL', 'APPROVED', 'REJECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-sm border ${
                statusFilter === filter
                  ? 'bg-[#6A7051] border-[#6A7051] text-white shadow-sm'
                  : 'bg-white border-card-border text-text-secondary hover:bg-slate-50'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
          <button
            onClick={() => {
              fetchHarvestSlips();
              toast.success('List reloaded!');
            }}
            className="p-2 text-text-muted hover:text-[#6A7051] hover:bg-slate-50 border border-card-border rounded-sm transition-all"
            title="Reload harvest slips"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Slips List Table - Web view & Cards - Mobile view */}
      <div className="bg-white border border-card-border shadow-sm">
        {filteredSlips.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Sprout className="text-slate-300 mx-auto mb-4" size={48} />
            <p className="text-brand-olive font-extrabold uppercase text-sm tracking-wider">No Harvest Slips Found</p>
            <p className="text-text-secondary text-xs mt-1 max-w-md mx-auto">Try adjusting your filters or create a new slip entry to get started.</p>
            <button
              onClick={() => navigate('/admin/procurement/harvest/new')}
              className="mt-4 bg-[#6A7051] text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all inline-flex items-center gap-2"
            >
              Create New Entry
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Web Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive">TP Slip No</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive">Farmer Name</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive">Date</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive">Vehicle / Driver</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive text-center">Total Boxes</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive text-right">Total Weight</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive text-center">Status</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-brand-olive text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {filteredSlips.map((slip) => (
                    <tr 
                      key={slip._id || slip.id} 
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-black text-brand-olive tracking-wider">
                        #{slip.tpNo || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-brand-olive uppercase">
                        {slip.farmerName || 'Unknown Farmer'}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary flex items-center gap-1.5 mt-1.5 border-none">
                        <Calendar size={13} className="text-text-muted" /> 
                        {slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        <div className="font-semibold text-brand-olive uppercase text-[11px]">
                          {slip.vehicleNo || 'No Vehicle'}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          Driver: {slip.driverName || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-center text-brand-olive">
                        {slip.totalBoxes || 0}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-right text-brand-olive">
                        {parseFloat(slip.totalWeight || 0).toFixed(2)} kg
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(slip.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/procurement/harvest/${slip._id || slip.id}`)}
                          className="text-[#6A7051] hover:text-[#5F6846] font-black uppercase text-[10px] tracking-widest flex items-center gap-1 justify-center mx-auto transition-colors group"
                        >
                          View Details <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive List Cards View */}
            <div className="block md:hidden divide-y divide-card-border">
              {filteredSlips.map((slip) => (
                <div 
                  key={slip._id || slip.id} 
                  className="p-4 space-y-3 hover:bg-slate-50/50"
                  onClick={() => navigate(`/admin/procurement/harvest/${slip._id || slip.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-brand-olive tracking-wider">
                      #{slip.tpNo || 'N/A'}
                    </span>
                    {getStatusBadge(slip.status)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-olive uppercase text-xs">
                      {slip.farmerName || 'Unknown Farmer'}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-text-muted mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> 
                        {slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : 'N/A'}
                      </span>
                      <span>
                        Vehicle: <strong className="text-brand-olive">{slip.vehicleNo || 'N/A'}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-card-border pt-2 text-[11px]">
                    <div>
                      <span className="text-text-muted">Boxes:</span> <strong className="text-brand-olive ml-1">{slip.totalBoxes || 0}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted">Weight:</span> <strong className="text-brand-olive ml-1">{parseFloat(slip.totalWeight || 0).toFixed(2)} kg</strong>
                    </div>
                    <span className="text-[#6A7051] font-black uppercase tracking-wider text-[9px] flex items-center gap-0.5">
                      Details <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HarvestSlips;
