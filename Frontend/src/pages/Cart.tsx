import React from 'react';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal, isLoading } = useCart();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ethnic-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-8 w-8 text-ethnic-primary" />
          <h1 className="text-3xl font-bold text-ethnic-primary font-heading">Your Cart</h1>
          {cartCount > 0 && (
            <span className="bg-ethnic-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {cartCount === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Discover amazing handcrafted items from local artisans</p>
            <Link to="/explore">
              <Button variant="ethnic" size="lg" className="px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {item.seller}</p>
                        <p className="text-xl font-bold text-ethnic-primary">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border rounded-lg p-1 bg-background">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-10 text-center py-2">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="border rounded-lg p-6 bg-card shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-base">
                      <p>Subtotal ({cartCount} items)</p>
                      <p>₹{cartTotal.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between text-base">
                      <p>Shipping</p>
                      <p className="text-green-600 font-medium">FREE</p>
                    </div>

                    <div className="flex justify-between text-base">
                      <p>Tax</p>
                      <p>₹0.00</p>
                    </div>
                  </div>

                  <div className="border-t my-6"></div>

                  <div className="flex justify-between font-bold text-xl mb-6">
                    <p>Total</p>
                    <p className="text-ethnic-primary">₹{cartTotal.toFixed(2)}</p>
                  </div>

                  <Link to="/checkout" className="block">
                    <Button variant="ethnic" className="w-full h-12 text-lg font-medium">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="mt-4 text-center">
                    <Link to="/explore" className="text-sm text-muted-foreground hover:text-ethnic-primary">
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure checkout with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;