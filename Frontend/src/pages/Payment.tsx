import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const PaymentPage = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'cancelled'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const upiId = 'gruhini-payments@upi';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}`;

  useEffect(() => {
    if (!orderId) {
      toast.error('No order found. Redirecting to home.');
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setPaymentStatus('cancelled');
          // TODO: Add backend call to cancel the order
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Simulate checking payment status
    const paymentCheckInterval = setInterval(() => {
      // In a real app, you would make an API call to your backend here
      // to check if the payment has been received for the orderId.
      // For simulation, we'll just log to the console.
      console.log(`Checking payment status for order ${orderId}...`);
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(timer);
      clearInterval(paymentCheckInterval);
    };
  }, [orderId, navigate]);

  const handleConfirmPayment = () => {
    // In a real app, this would involve a callback from a payment gateway.
    // Here, we'll just simulate a successful payment.
    setPaymentStatus('success');
    toast.success('Payment successful! Your order has been placed.');

    // TODO: Add backend call to update order status and add transaction ID

    // Clear the cart after successful payment
    clearCart();

    // Redirect to the order confirmation page
    navigate('/order-confirmation', { state: { orderId } });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-sm text-center">
          {paymentStatus === 'pending' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-ethnic-primary">Complete Your Payment</h1>
              <div className="flex items-center justify-center gap-2 text-lg mb-4 text-destructive">
                <Clock className="h-6 w-6" />
                <span>Time left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
              </div>
              <p className="text-muted-foreground mb-6">Scan the QR code or use the UPI ID to pay.</p>

              <div className="flex justify-center mb-6">
                <img src={qrCodeUrl} alt="UPI QR Code" className="rounded-lg border p-2" />
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground">UPI ID:</p>
                <p className="font-semibold text-lg">{upiId}</p>
              </div>

              <Button onClick={handleConfirmPayment} variant="ethnic" className="w-full">
                I have paid
              </Button>
            </>
          )}

          {paymentStatus === 'success' && (
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-500">Payment Successful!</h1>
              <p className="text-muted-foreground">Your order has been placed. You will be redirected shortly.</p>
            </div>
          )}

          {paymentStatus === 'cancelled' && (
            <div>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-destructive">Order Cancelled</h1>
              <p className="text-muted-foreground">The payment was not completed in time.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
