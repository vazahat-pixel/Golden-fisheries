import React, { useState, useEffect } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import {
  FileText, IndianRupee, Printer, Plus, ArrowLeft, Search,
  Calendar, CreditCard, User, AlertCircle, TrendingUp, DollarSign, Wallet
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import { toast } from 'react-hot-toast';

export default function FarmerLedger() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [statement, setStatement] = useState([]);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Fetch summaries of all active farmers' balances
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/farmer-ledger/summary');
      setFarmers(res.data || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load farmer balance summary');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Fetch statements for a specific farmer
  const selectFarmer = async (farmer) => {
    setSelectedFarmer(farmer);
    setLoadingStatement(true);
    try {
      const res = await apiClient.get(`/farmer-ledger/${farmer._id}`);
      setStatement(res.data || []);
      setLoadingStatement(false);
    } catch (err) {
      toast.error('Failed to load farmer statement');
      setLoadingStatement(false);
    }
  };

  const handlePostPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      return toast.error('Please enter a valid payment amount');
    }

    setSubmittingPayment(true);
    try {
      await apiClient.post('/farmer-ledger/payment', {
        farmerId: selectedFarmer._id,
        creditAmount: parseFloat(paymentAmount),
        description: paymentDescription || 'Cash/Online Payment to Farmer'
      });
      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDescription('');
      setSubmittingPayment(false);
      // Reload both statement and summaries
      selectFarmer(selectedFarmer);
      fetchSummaries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
      setSubmittingPayment(false);
    }
  };

  const filteredFarmers = farmers.filter(f =>
    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farmerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-card-border pb-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#6B7550] mb-1">FINANCIALS</p>
          <h1 className="text-2xl font-serif italic font-black text-black">
            Farmer <span className="text-[#6B7550]">Ledgers.</span>
          </h1>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">Real-time supply liability &amp; payouts</p>
        </div>
        {selectedFarmer && (
          <button
            onClick={() => setSelectedFarmer(null)}
            className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Summary
          </button>
        )}
      </div>

      {!selectedFarmer ? (
        // ─── VIEW A: FARMER BALANCE SUMMARY LIST ──────────────────────────
        <div className="space-y-4">
          {/* Metrics Quick Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Total Active Farmers', value: farmers.length, icon: User, color: 'text-black bg-slate-100' },
              { label: 'Total Supplies Finalized', value: '₹' + Math.round(farmers.reduce((s, f) => s + (f.totalSupplied || 0), 0)).toLocaleString(), icon: TrendingUp, color: 'text-[#6B7550] bg-olive-50/50' },
              { label: 'Outstanding Liabilities', value: '₹' + Math.round(farmers.reduce((s, f) => s + (f.balanceDue || 0), 0)).toLocaleString(), icon: Wallet, color: 'text-red-600 bg-red-50' },
            ].map((m, i) => (
              <div key={i} className="bg-white border border-card-border shadow-subtle p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xl font-serif italic font-black text-black">{m.value}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-text-muted mt-0.5">{m.label}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${m.color}`}><m.icon size={16} /></div>
              </div>
            ))}
          </div>

          {/* Search bar & Table */}
          <Card className="border border-card-border shadow-subtle bg-white overflow-hidden" padding="none">
            <div className="p-4 border-b border-card-border flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50/40">
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search farmers name or code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-card-border pl-9 pr-4 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#6B7550]"
                />
              </div>
              <p className="text-[8px] text-text-muted font-bold uppercase">Click "View Statement" to see full history</p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Loading ledger data...</div>
            ) : filteredFarmers.length === 0 ? (
              <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No farmers matching criteria.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-olive-50/10 border-b border-card-border">
                    {['Farmer Code', 'Farmer Name', 'Location', 'Total Supplies', 'Total Paid', 'Balance Due', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40">
                  {filteredFarmers.map(f => (
                    <tr key={f._id} className="hover:bg-olive-50/10 transition-colors">
                      <td className="px-5 py-3.5 text-[10px] font-bold text-text-muted font-mono">{f.farmerCode || '—'}</td>
                      <td className="px-5 py-3.5 text-[11px] font-black text-black uppercase">{f.fullName}</td>
                      <td className="px-5 py-3.5 text-[10px] font-bold text-text-muted uppercase">{f.location || '—'}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-black">₹{(f.totalSupplied || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-emerald-600">₹{(f.totalPaid || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-black ${(f.balanceDue || 0) > 0 ? 'text-red-600' : 'text-black'}`}>
                          ₹{(f.balanceDue || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 flex gap-2">
                        <Button
                          onClick={() => selectFarmer(f)}
                          size="sm"
                          className="text-[9px] font-bold uppercase tracking-widest bg-black text-white hover:bg-slate-800 h-7"
                        >
                          View Statement
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      ) : (
        // ─── VIEW B: DETAILED TRANSACTIONAL STATEMENT ─────────────────────
        <div className="space-y-4">
          {/* Farmer profile banner card */}
          <div className="bg-white border border-card-border shadow-subtle p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-lg border shrink-0">
                {selectedFarmer.fullName[0]}
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-serif italic font-bold text-black uppercase tracking-tight">{selectedFarmer.fullName}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-text-muted font-bold">
                  <span>CODE: <strong className="font-mono text-black">{selectedFarmer.farmerCode || '—'}</strong></span>
                  <span>PHONE: <strong className="text-black">{selectedFarmer.phone || '—'}</strong></span>
                  <span>LOCATION: <strong className="text-black uppercase">{selectedFarmer.location || '—'}</strong></span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPaymentModal(true)}
                size="sm"
                className="text-[9px] font-black uppercase tracking-widest bg-[#6B7550] hover:bg-[#5a6340] h-9 text-white flex items-center gap-1.5 shadow-md"
              >
                <Plus size={12} /> Record Payment
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="text-[9px] font-bold uppercase tracking-widest border-card-border h-9 bg-white flex items-center gap-1.5"
              >
                <Printer size={12} /> Print Statement
              </Button>
            </div>
          </div>

          {/* Statement balances bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Supply Finalized', value: '₹' + Math.round(selectedFarmer.totalSupplied || 0).toLocaleString(), color: 'text-black' },
              { label: 'Total Paid out', value: '₹' + Math.round(selectedFarmer.totalPaid || 0).toLocaleString(), color: 'text-emerald-600' },
              { label: 'Outstanding Balance', value: '₹' + Math.round(selectedFarmer.balanceDue || 0).toLocaleString(), color: 'text-red-600 font-black' },
              { label: 'Status', value: selectedFarmer.balanceDue > 0 ? 'LIABILITY PENDING' : 'SETTLED', color: selectedFarmer.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-700' }
            ].map((b, i) => (
              <div key={i} className="bg-slate-50/60 border border-card-border p-3.5 rounded-xl">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-muted mb-0.5">{b.label}</p>
                <p className={`text-base font-bold ${b.color}`}>{b.value}</p>
              </div>
            ))}
          </div>

          {/* Detailed Statement Table */}
          <Card className="border border-card-border shadow-subtle bg-white overflow-hidden" padding="none">
            <div className="px-6 py-4 border-b border-card-border bg-slate-50/40 flex justify-between items-center">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted">TRANSACTION STATEMENT STATEMENT</h3>
              <Badge variant="primary" className="text-[8px] font-bold">DOUBLE ENTRY</Badge>
            </div>

            {loadingStatement ? (
              <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Fetching full statement logs...</div>
            ) : statement.length === 0 ? (
              <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No transaction entries on record.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-olive-50/10 border-b border-card-border">
                    {['Date', 'Type', 'Description', 'Debit (Supply We Owe)', 'Credit (Payment Made)', 'Running Balance', 'Audited By'].map(h => (
                      <th key={h} className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 text-[10px]">
                  {statement.map(item => (
                    <tr key={item._id} className="hover:bg-olive-50/10 transition-colors">
                      <td className="px-5 py-3.5 text-text-muted font-bold font-mono">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            item.entryType === 'SUPPLY' ? 'primary' :
                            item.entryType === 'PAYMENT' ? 'success' : 'warning'
                          }
                          className="text-[8px] font-bold"
                        >
                          {item.entryType}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[10.5px] font-bold text-black">{item.description}</td>
                      <td className="px-5 py-3.5 font-bold text-black">
                        {item.debitAmount > 0 ? `₹${item.debitAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600">
                        {item.creditAmount > 0 ? `₹${item.creditAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-black ${(item.balanceAfter || 0) > 0 ? 'text-red-600' : 'text-black'}`}>
                          ₹{(item.balanceAfter || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-text-muted font-mono">{item.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Record Payment Overlay Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handlePostPayment} className="bg-white border border-card-border shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-card-border flex justify-between items-center bg-olive-50/10">
              <div>
                <h3 className="text-xs font-serif italic font-bold text-black flex items-center gap-1.5">
                  <CreditCard size={14} className="text-accent-olive" /> Record Farmer Payment
                </h3>
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Post cash or online payout entry</p>
              </div>
            </div>

            {/* Fields */}
            <div className="p-5 space-y-3.5 text-[10px]">
              <div className="bg-[#6B7550]/5 border border-[#6B7550]/10 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-text-muted font-bold uppercase">Outstanding Liability</p>
                  <p className="text-sm font-bold text-red-600">₹{(selectedFarmer?.balanceDue || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-text-muted font-bold uppercase">Farmer</p>
                  <p className="font-bold text-black uppercase">{selectedFarmer?.fullName}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase text-[8px]">Payment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-card-border px-2.5 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive bg-white rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase text-[8px]">Remarks / Description</label>
                <textarea
                  placeholder="e.g., Paid via HDFC bank transfer ref TXN48929"
                  value={paymentDescription}
                  onChange={e => setPaymentDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-card-border px-2.5 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive bg-white rounded-none resize-none"
                />
              </div>
            </div>

            {/* Action footer */}
            <div className="px-5 py-3 border-t border-card-border bg-slate-50 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="text-[9px] font-bold uppercase tracking-widest h-8 border-card-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingPayment}
                className="text-[9px] font-bold uppercase tracking-widest bg-[#6B7550] hover:bg-[#5a6340] h-8 text-white"
              >
                {submittingPayment ? 'Posting...' : 'Post Payout'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
