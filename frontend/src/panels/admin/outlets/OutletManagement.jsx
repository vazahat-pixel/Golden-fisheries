import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useOutletStore } from '../../../store/outletStore';
import { 
  Store, 
  Utensils, 
  Search, 
  Filter, 
  Power, 
  PowerOff,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OutletManagement = () => {
  const { restaurants, fishMalls, toggleRestaurantStatus, toggleFishMallStatus } = useOutletStore();
  const [activeTab, setActiveTab] = useState('RESTAURANTS');
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = activeTab === 'RESTAURANTS' ? restaurants : fishMalls;
  const filteredData = currentData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.includes(searchQuery)
  );

  const stats = {
    total: restaurants.length + fishMalls.length,
    active: restaurants.filter(r => r.status === 'ACTIVE').length + fishMalls.filter(m => m.status === 'ACTIVE').length,
    inactive: restaurants.filter(r => r.status === 'INACTIVE').length + fishMalls.filter(m => m.status === 'INACTIVE').length,
  };

  const handleToggle = (id) => {
    if (activeTab === 'RESTAURANTS') {
      toggleRestaurantStatus(id);
    } else {
      toggleFishMallStatus(id);
    }
    toast.success('Outlet status updated successfully');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">Outlet <span className="text-[#6B7550]">Management.</span></h1>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">Registry of all registered partners</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
           <div className="bg-black text-white px-4 py-2 flex flex-col items-center min-w-[80px] border border-white/10 shadow-lg">
              <span className="text-xl font-black leading-none">{stats.total}</span>
              <span className="text-[7px] font-black uppercase tracking-widest opacity-50">Total</span>
           </div>
           <div className="bg-[#6B7550] text-white px-4 py-2 flex flex-col items-center min-w-[80px] shadow-lg">
              <span className="text-xl font-black leading-none">{stats.active}</span>
              <span className="text-[7px] font-black uppercase tracking-widest opacity-50">Active</span>
           </div>
           <div className="bg-red-500 text-white px-4 py-2 flex flex-col items-center min-w-[80px] shadow-lg">
              <span className="text-xl font-black leading-none">{stats.inactive}</span>
              <span className="text-[7px] font-black uppercase tracking-widest opacity-50">Inactive</span>
           </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 border border-black/5 shadow-subtle">
         <div className="flex bg-gray-100 p-1 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('RESTAURANTS')}
              className={`flex-1 md:flex-none px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'RESTAURANTS' ? 'bg-black text-white shadow-xl' : 'text-text-muted hover:text-black'}`}
            >
              <Utensils size={14} /> Restaurants
            </button>
            <button 
              onClick={() => setActiveTab('FISH_MALLS')}
              className={`flex-1 md:flex-none px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'FISH_MALLS' ? 'bg-black text-white shadow-xl' : 'text-text-muted hover:text-black'}`}
            >
              <Store size={14} /> Fish Malls
            </button>
         </div>

         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-black/10 transition-all"
            />
         </div>
      </div>

      {/* Grid View */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden border border-black/10 bg-white rounded-none shadow-subtle hover:shadow-wapixo transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div className={`w-12 h-12 flex items-center justify-center shadow-inner ${activeTab === 'RESTAURANTS' ? 'bg-olive-50 text-[#6B7550]' : 'bg-blue-50 text-blue-600'}`}>
                      {activeTab === 'RESTAURANTS' ? <Utensils size={24} /> : <Store size={24} />}
                   </div>
                   <Badge className={`font-black uppercase tracking-widest text-[8px] px-3 py-1 border border-black/5 rounded-none ${item.status === 'ACTIVE' ? 'bg-[#6B7550] text-white' : 'bg-red-500 text-white'}`}>
                      {item.status}
                   </Badge>
                </div>

                <div className="mb-6">
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{item.id}</p>
                   <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none group-hover:text-[#6B7550] transition-colors">{item.name}</h3>
                </div>

                <div className="space-y-3 mb-8">
                   <div className="flex items-center gap-3 text-text-muted">
                      <Phone size={14} className="shrink-0" />
                      <span className="text-[11px] font-black">{item.phone}</span>
                   </div>
                   <div className="flex items-center gap-3 text-text-muted">
                      <Mail size={14} className="shrink-0" />
                      <span className="text-[11px] font-black truncate">{item.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-text-muted">
                      <Calendar size={14} className="shrink-0" />
                      <span className="text-[11px] font-black uppercase">{new Date(item.registeredAt).toLocaleDateString()}</span>
                   </div>
                </div>

                <Button 
                  onClick={() => handleToggle(item.id)}
                  variant={item.status === 'ACTIVE' ? 'destructive' : 'default'}
                  className={`w-full py-4 rounded-none font-black text-[10px] uppercase tracking-widest gap-2 transition-all ${item.status === 'ACTIVE' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-black text-white hover:bg-[#6B7550]'}`}
                >
                  {item.status === 'ACTIVE' ? (
                    <> <PowerOff size={16} /> DEACTIVATE ACCOUNT </>
                  ) : (
                    <> <Power size={16} /> ACTIVATE ACCOUNT </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-black/10">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Store size={40} className="text-gray-200" />
           </div>
           <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">No Outlets Found</h3>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">Try adjusting your search or filters</p>
           </div>
           <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest">Clear Search</Button>
        </div>
      )}
    </div>
  );
};

export default OutletManagement;
