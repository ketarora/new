import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { cartItems, cartCount } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    note: '',
  });
  const [pincodeDetails, setPincodeDetails] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  useEffect(() => {
    if (cartCount === 0) {
      toast.error("Your cart is empty. Redirecting to shopping page.");
      navigate('/explore');
    }
  }, [cartCount, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    setFormData(prev => ({ ...prev, pincode }));
    setPincodeDetails(null);
    setPincodeError('');

    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success') {
          setPincodeDetails(data[0].PostOffice[0]);
        } else {
          setPincodeError('Invalid or not-serviceable pincode.');
        }
      } catch (error) {
        setPincodeError('Failed to validate pincode.');
        console.error('Pincode validation error:', error);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeDetails) {
      toast.error('Please enter a valid pincode.');
      return;
    }

    const orderData = {
      ...formData,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response = await fetch('https://grihini-wtbw.onrender.com/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const newOrder = await response.json();
      console.log('Order created:', newOrder);
      toast.success('Order details submitted! Proceeding to payment.');
      navigate('/payment', { state: { orderId: newOrder.orderId } });
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to submit order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-ethnic-primary font-heading">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg shadow-sm">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" type="text" placeholder="House No, Street, Landmark" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handlePincodeChange} required maxLength={6} />
                {pincodeDetails && (
                  <div className="text-sm text-green-600 mt-1">
                    {
                      // @ts-ignore
                      pincodeDetails.District
                    }, {
                      // @ts-ignore
                      pincodeDetails.State
                    }
                  </div>
                )}
                {pincodeError && (
                  <div className="text-sm text-red-600 mt-1">
                    {pincodeError}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="note">Customization Note (Optional)</Label>
                <Input id="note" name="note" value={formData.note} onChange={handleInputChange} />
              </div>
              <Button type="submit" variant="ethnic" className="w-full">
                Proceed to Payment
              </Button>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border rounded-lg p-6 bg-card shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Your Order</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t my-4"></div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>₹{subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>GST (18%)</p>
                    <p>₹{gst.toFixed(2)}</p>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>₹{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
