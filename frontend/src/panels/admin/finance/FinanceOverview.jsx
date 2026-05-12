import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { StatCard } from '../../../design-system/components/StatCard';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Modal } from '../../../design-system/components/Modal';
import { useAdminStore } from '../../../store/adminStore';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download,
  Filter,
  Plus,
  Check,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const chartData = [
  { month: 'Jan', profit: 45000, expense: 32000 },
  { month: 'Feb', profit: 52000, expense: 38000 },
  { month: 'Mar', profit: 48000, expense: 41000 },
  { month: 'Apr', profit: 61000, expense: 45000 },
];

const expenseCategoryData = [
  { name: 'Procurement', value: 65, color: '#5F6846' },
  { name: 'Logistics', value: 20, color: '#8C9375' },
  { name: 'Operations', value: 10, color: '#E8E1C8' },
  { name: 'Misc', value: 5, color: '#000000' },
];

const FinanceOverview = () => {
  const navigate = useNavigate();
  const { transactions, addTransaction, purchaseInvoices, expenses } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ desc: '', amount: '', method: 'CASH' });
  const [activeSource, setActiveSource] = useState('ALL');

  const filteredTransactions = transactions.filter(t => 
    activeSource === 'ALL' || t.source === activeSource || (activeSource === 'ADMIN' && !t.source)
  );

  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleAddExpense = () => {
    if (!formData.desc || !formData.amount) {
      toast.error('Please fill all fields');
      return;
    }
    
    addTransaction({
      date: new Date().toLocaleDateString('en-GB'),
      desc: formData.desc.toUpperCase(),
      method: formData.method,
      type: 'expense',
      amount: Number(formData.amount)
    });
    
    setIsModalOpen(false);
    setFormData({ desc: '', amount: '', method: 'CASH' });
    toast.success('Expense recorded');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Finance & <span className="text-accent-olive">Accounts.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">PROFIT TRACKING • FISCAL REPORTS</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle"
            onClick={() => window.print()}
          >
            <Download size={12} /> EXPORT TALLY
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle relative"
            onClick={() => navigate('/admin/expenses')}
          >
            <Receipt size={12} /> REVIEW CLAIMS
            {expenses.filter(e => e.status === 'Pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-[7px] font-black text-white flex items-center justify-center border-2 border-white">
                {expenses.filter(e => e.status === 'Pending').length}
              </span>
            )}
          </Button>
          <Button 
            size="sm"
            className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={12} /> ADD EXPENSE
          </Button>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-2 overflow-x-auto no-scrollbar">
        {['ALL', 'ADMIN', 'RESTAURANT', 'FISHMALL', 'LOGISTICS'].map(source => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest transition-all",
              activeSource === source 
                ? "bg-black text-white shadow-md" 
                : "bg-white text-text-muted hover:bg-olive-50 border border-card-border"
            )}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="TOTAL REVENUE" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} icon={IndianRupee} trend="+12%" trendType="up" />
        <StatCard title="NET PROFIT" value={`₹${((totalRevenue - totalExpense) / 1000).toFixed(1)}K`} icon={TrendingUp} trend="+8.4%" trendType="up" />
        <StatCard title="EXPENSES" value={`₹${(totalExpense / 1000).toFixed(1)}K`} icon={TrendingDown} trend="+4.2%" trendType="down" />
        <StatCard title="LIQUIDITY" value="₹1.25L" icon={Wallet} trend="LIQUID" trendType="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-white border border-card-border shadow-subtle" padding="none">
          <div className="px-4 py-2.5 border-b border-card-border flex justify-between items-center bg-white">
            <h3 className="font-serif italic font-bold text-lg text-black uppercase tracking-tight">Revenue vs Expense</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-black"></div><span className="text-[8px] font-bold uppercase text-text-muted">REVENUE</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-accent-olive"></div><span className="text-[8px] font-bold uppercase text-text-muted">EXPENSE</span></div>
            </div>
          </div>
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8E8E8E', fontSize: 9, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E8E', fontSize: 9, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#F9F9F9'}} contentStyle={{ borderRadius: '0px', border: '1px solid #E8E1C8', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }} />
                <Bar dataKey="profit" fill="#000000" barSize={20} />
                <Bar dataKey="expense" fill="#5F6846" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="border border-card-border shadow-subtle bg-white flex flex-col p-4">
          <h3 className="font-serif italic font-bold text-lg text-black uppercase tracking-tight mb-4 text-center md:text-left">Distribution</h3>
          <div className="h-[150px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                  {expenseCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '9px', fontWeight: '700' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[12px] font-serif italic font-bold text-black">100%</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 overflow-y-auto">
            {expenseCategoryData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 px-3 border-b border-olive-50 last:border-0 hover:bg-olive-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2" style={{backgroundColor: item.color}}></div>
                  <span className="text-[9px] font-bold text-black uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold text-text-muted">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card padding="none" className="border border-card-border shadow-subtle overflow-hidden bg-white">
        <div className="px-4 py-2 border-b border-card-border flex justify-between items-center bg-white">
          <h3 className="font-serif italic font-bold text-lg text-black tracking-tight">Recent Ledger</h3>
          <Button variant="outline" size="sm" className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest border-card-border"><Filter size={12} className="mr-1" /> FILTERS</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Date</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Description</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-center">Method</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Type</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {filteredTransactions.map((t, i) => (
                <tr key={i} className="hover:bg-olive-50/30 transition-colors group">
                  <td className="px-4 py-2.5 text-[9px] font-bold text-text-muted group-hover:text-black">{t.date}</td>
                  <td className="px-4 py-2.5 text-[10px] font-bold text-black uppercase tracking-tight">{t.desc}</td>
                  <td className="px-4 py-2.5 text-center"><Badge variant="secondary" className="bg-olive-50/50 text-[7px] border-none px-1.5">{t.method}</Badge></td>
                  <td className="px-4 py-2.5">
                    <div className={clsx('w-2 h-2 rounded-full inline-block mr-2', t.type === 'income' ? 'bg-green-500' : 'bg-red-500')}></div>
                    <span className="text-[9px] font-bold uppercase text-text-muted">{t.type}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-[11px] font-bold text-right ${t.type === 'income' ? 'text-black' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Purchase Invoices (Accounts Payable) */}
      <Card padding="none" className="border border-card-border shadow-subtle overflow-hidden bg-white">
        <div className="px-4 py-2 border-b border-card-border flex justify-between items-center bg-black text-white">
          <div>
            <h3 className="font-serif italic font-bold text-lg tracking-tight uppercase">Accounts Payable</h3>
            <p className="text-[7px] font-bold opacity-50 uppercase tracking-widest">Farmer & Supplier Obligations</p>
          </div>
          <Badge className="bg-accent-olive text-black border-none text-[8px]">₹{(purchaseInvoices?.reduce((acc, inv) => acc + (inv.status === 'unpaid' ? inv.amount : 0), 0) || 0).toLocaleString()} PENDING</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Farmer</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Date</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Due Date</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-center">Status</th>
                <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {purchaseInvoices?.length > 0 ? purchaseInvoices.map((inv, i) => (
                <tr key={i} className="hover:bg-olive-50/30 transition-colors group">
                  <td className="px-4 py-2.5 text-[10px] font-bold text-black uppercase tracking-tight">{inv.farmer}</td>
                  <td className="px-4 py-2.5 text-[9px] font-bold text-text-muted">{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2.5 text-[9px] font-bold text-red-400">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="text-[7px] border-none px-1.5 uppercase">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] font-bold text-right text-black">
                    ₹{inv.amount.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">No outstanding payables</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Record New Expense"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">DESCRIPTION</label>
            <input 
              type="text" 
              placeholder="E.G. DIESEL FOR MH-12..."
              value={formData.desc} 
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">AMOUNT (₹)</label>
              <input 
                type="number" 
                placeholder="0"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">METHOD</label>
              <select 
                value={formData.method} 
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none bg-white appearance-none"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK">BANK</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button className="flex-1 text-[9px] font-bold h-9 gap-2" onClick={handleAddExpense}><Check size={14} /> RECORD EXPENSE</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceOverview;
