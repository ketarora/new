import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await fetch(`https://grihini-wtbw.onrender.com/orders/${orderId}`);
          const data = await response.json();
          setOrderDetails(data);
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">Order not found.</h1>
        <Link to="/">
          <Button variant="link">Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-sm text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-green-500">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-6">Thank you for your purchase.</p>

          <div className="text-left space-y-4 border-t border-b py-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{
                // @ts-ignore
                orderDetails.orderId
              }</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Transaction ID:</span>
              <span>{
                // @ts-ignore
                orderDetails.paymentTransactionId
              }</span>
            </div>
            <div>
              <h3 className="font-medium mb-2">Shipping Address:</h3>
              <p className="text-muted-foreground">
                {
                  // @ts-ignore
                  orderDetails.name
                }<br />
                {
                  // @ts-ignore
                  orderDetails.address
                }<br />
                {
                  // @ts-ignore
                  orderDetails.pincode
                }
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Items Ordered:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {
                  // @ts-ignore
                  orderDetails.items.map(item => (
                  <li key={item.id}>
                    {item.name} (x{item.quantity})
                  </li>
                ))}
              </ul>
            </div>
            {
              // @ts-ignore
              orderDetails.note && (
              <div>
                <h3 className="font-medium">Note:</h3>
                <p className="text-muted-foreground">{
                  // @ts-ignore
                  orderDetails.note
                }</p>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Paid:</span>
              <span>₹{
                // @ts-ignore
                orderDetails.total.toFixed(2)
              }</span>
            </div>
          </div>

          <Link to="/explore">
            <Button variant="ethnic" className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
