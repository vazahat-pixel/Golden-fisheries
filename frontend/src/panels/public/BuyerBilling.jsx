import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/public/${id}`);
        const data = await response.json();
        setBillDetails(data.data.invoice);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bill', error);
        setLoading(false);
      }
    };
    if (id) {
      fetchBill();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Bill...</div>;
  }

  if (!billDetails) {
    return <div className="min-h-screen flex items-center justify-center">Bill Not Found</div>;
  }

  const handlePayment = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/public/payment/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      });
      const data = await response.json();
      if (response.ok) {
        setIsPaid(true);
        toast.success('Payment successful!');
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error', error);
      toast.error('Payment failed');
    }
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-olive-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-olive-500 text-center mb-8 max-w-sm">
          Thank you for your business. A receipt has been sent to your WhatsApp.
        </p>
        <Card className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-olive-500 font-medium">Amount Paid</span>
            <span className="text-xl font-black text-primary">₹{billDetails.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-olive-500 font-medium">Transaction ID</span>
            <span className="font-bold text-gray-900">TXN987654321</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive-50 pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-4 pb-8 rounded-none shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.PNG" alt="Golden Fisheries" className="w-10 h-10 object-contain rounded-none" />
            <div>
              <h1 className="text-lg font-black tracking-tight">Golden Fisheries</h1>
              <p className="text-olive-200 text-xs font-medium">Secure Payment Portal</p>
            </div>
          </div>
          
          <p className="text-olive-200 text-sm font-medium mb-1">Total Amount Due</p>
          <h2 className="text-5xl font-black mb-4">₹{billDetails.totalAmount.toLocaleString()}</h2>
          <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
            Invoice {billDetails.invoiceNumber}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-4">
        <Card className="p-6 mb-6 shadow-xl">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary" /> Order Summary
          </h3>
          <div className="space-y-4 mb-6">
            {billDetails.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                  <p className="text-xs text-olive-500">{item.quantity} KG x ₹{item.rate}</p>
                </div>
                <p className="text-sm font-black text-gray-900">₹{item.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-olive-100 space-y-2">
            <div className="flex justify-between text-sm text-olive-500">
              <span>Subtotal</span>
              <span>₹{billDetails.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-olive-500">
              <span>Taxes</span>
              <span>₹{billDetails.taxAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <h3 className="font-bold text-gray-900 mb-4 px-2">Select Payment Method</h3>
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => setPaymentMethod('upi')}
            className={clsx(
              'w-full p-4 rounded-none border-2 flex items-center justify-between transition-all',
              paymentMethod === 'upi' ? 'border-primary bg-olive-50' : 'border-olive-200 bg-white hover:border-olive-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive-50 rounded-none flex items-center justify-center text-primary">
                <CreditCard size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">UPI / QR Code</p>
                <p className="text-xs text-olive-500">Google Pay, PhonePe, Paytm</p>
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
              'w-full p-4 rounded-none border-2 flex items-center justify-between transition-all',
              paymentMethod === 'bank' ? 'border-primary bg-olive-50' : 'border-olive-200 bg-white hover:border-olive-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive-50 rounded-none flex items-center justify-center text-primary">
                <Banknote size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Bank Transfer</p>
                <p className="text-xs text-olive-500">IMPS, NEFT, RTGS</p>
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
          className="w-full py-4 text-lg font-black rounded-none shadow-xl shadow-primary/20 gap-2"
          disabled={!paymentMethod}
          onClick={handlePayment}
        >
          Pay ₹{billDetails.totalAmount.toLocaleString()} <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default BuyerBilling;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

