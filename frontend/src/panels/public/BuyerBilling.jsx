import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  MapPin,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

const BuyerBilling = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const billDetails = {
    id: 'INV-2026-089',
    date: '30 Apr, 2026',
    items: [
      { name: 'Rohu (Large)', qty: '120 KG', rate: '₹140', total: 16800 },
      { name: 'Catla', qty: '80 KG', rate: '₹130', total: 10400 },
    ],
    subtotal: 27200,
    tax: 1360,
    total: 28560
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-center mb-8 max-w-sm">
          Thank you for your business. A receipt has been sent to your WhatsApp.
        </p>
        <Card className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Amount Paid</span>
            <span className="text-xl font-black text-primary">₹{billDetails.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Transaction ID</span>
            <span className="font-bold text-gray-900">TXN987654321</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6 pb-12 rounded-b-[40px] shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
              🐟
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">MKE Seafood</h1>
              <p className="text-blue-200 text-xs font-medium">Secure Payment Portal</p>
            </div>
          </div>
          
          <p className="text-blue-200 text-sm font-medium mb-1">Total Amount Due</p>
          <h2 className="text-5xl font-black mb-4">₹{billDetails.total.toLocaleString()}</h2>
          <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
            Invoice {billDetails.id}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 -mt-6">
        <Card className="p-6 mb-6 shadow-xl">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary" /> Order Summary
          </h3>
          <div className="space-y-4 mb-6">
            {billDetails.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.qty} x {item.rate}</p>
                </div>
                <p className="text-sm font-black text-gray-900">₹{item.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{billDetails.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Taxes (5%)</span>
              <span>₹{billDetails.tax.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <h3 className="font-bold text-gray-900 mb-4 px-2">Select Payment Method</h3>
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => setPaymentMethod('upi')}
            className={clsx(
              'w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all',
              paymentMethod === 'upi' ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                <CreditCard size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">UPI / QR Code</p>
                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
              </div>
            </div>
            <div className={clsx(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              paymentMethod === 'upi' ? 'border-primary' : 'border-gray-300'
            )}>
              {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
            </div>
          </button>

          <button 
            onClick={() => setPaymentMethod('bank')}
            className={clsx(
              'w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all',
              paymentMethod === 'bank' ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                <Banknote size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Bank Transfer</p>
                <p className="text-xs text-gray-500">IMPS, NEFT, RTGS</p>
              </div>
            </div>
            <div className={clsx(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              paymentMethod === 'bank' ? 'border-primary' : 'border-gray-300'
            )}>
              {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium mb-6">
          <Lock size={12} /> SSL Encrypted Secure Checkout
        </div>

        <Button 
          className="w-full py-4 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 gap-2"
          disabled={!paymentMethod}
          onClick={() => setIsPaid(true)}
        >
          Pay ₹{billDetails.total.toLocaleString()} <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default BuyerBilling;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
