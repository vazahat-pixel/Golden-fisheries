import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { StatCard } from '../../../design-system/components/StatCard';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  FileSpreadsheet,
  Download,
  Calendar
} from 'lucide-react';
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

const data = [
  { month: 'Jan', profit: 45000, expense: 32000 },
  { month: 'Feb', profit: 52000, expense: 38000 },
  { month: 'Mar', profit: 48000, expense: 41000 },
  { month: 'Apr', profit: 61000, expense: 45000 },
];

const expenseCategoryData = [
  { name: 'Procurement', value: 65, color: '#0066FF' },
  { name: 'Logistics', value: 20, color: '#3385FF' },
  { name: 'Operations', value: 10, color: '#66A3FF' },
  { name: 'Misc', value: 5, color: '#99C2FF' },
];

const FinanceOverview = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Accounts</h1>
          <p className="text-gray-500 font-medium">Profit tracking, operational expenses, and fiscal reports.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} /> Export Tally
          </Button>
          <Button className="gap-2">
            <IndianRupee size={18} /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Monthly Revenue" value="₹8.45L" trend="+12%" icon={IndianRupee} />
        <StatCard title="Net Profit" value="₹2.10L" trend="+8.4%" icon={TrendingUp} variant="success" />
        <StatCard title="Total Expenses" value="₹6.35L" trend="+4.2%" icon={TrendingDown} trendType="down" />
        <StatCard title="Cash on Hand" value="₹1.25L" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2" padding="none">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Revenue vs Expense</h3>
            <div className="flex gap-2">
              <Badge variant="primary" className="rounded-md">Revenue</Badge>
              <Badge variant="gray" className="rounded-md">Expense</Badge>
            </div>
          </div>
          <div className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="profit" fill="#0066FF" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="expense" fill="#CCE0FF" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="none">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Expense Distribution</h3>
          </div>
          <div className="p-6 h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-6">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                <p className="text-lg font-black text-gray-900">100%</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {expenseCategoryData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <Button variant="ghost" size="sm">View Ledger</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { date: '30/04/26', desc: 'Diesel KA-01-AX-1234', method: 'Cash', type: 'expense', amount: '₹1,200' },
                { date: '29/04/26', desc: 'Payment - Golden Rest.', method: 'UPI', type: 'income', amount: '₹12,500' },
                { date: '29/04/26', desc: 'Ramu Fisheries Purchase', method: 'Bank Transfer', type: 'expense', amount: '₹40,000' },
                { date: '28/04/26', desc: 'Fish Mall Daily Sales', method: 'Cash', type: 'income', amount: '₹18,400' },
              ].map((t, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.desc}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{t.method}</td>
                  <td className="px-6 py-4">
                    <Badge variant={t.type === 'income' ? 'success' : 'danger'}>
                      {t.type}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinanceOverview;
