import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext'; // Make sure this exists and provides user + isAuthenticated

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  syncWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth(); // Get auth state

  const API_BASE_URL = 'https://grihini-wtbw.onrender.com'; // ✅ Your deployed backend

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncWithBackend();
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        await loadCartFromServer();
      } else {
        loadCartFromLocal();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      loadCartFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartFromLocal = () => {
    try {
      const storedCartItems = localStorage.getItem('gruhini_cart');
      if (storedCartItems) {
        const parsedItems = JSON.parse(storedCartItems);
        if (Array.isArray(parsedItems)) {
          setCartItems(parsedItems);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('gruhini_cart');
    }
  };

  const loadCartFromServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const serverCart = await response.json();
        const localCart = getLocalCart();
        const mergedCart = mergeCartItems(localCart, serverCart.items || []);

        setCartItems(mergedCart);

        if (localCart.length > 0) {
          await saveCartToServer(mergedCart);
          localStorage.removeItem('gruhini_cart');
        }
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
    }
  };

  const getLocalCart = (): CartItem[] => {
    try {
      const stored = localStorage.getItem('gruhini_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const mergeCartItems = (local: CartItem[], server: CartItem[]): CartItem[] => {
    const merged = [...server];
    local.forEach(item => {
      const idx = merged.findIndex(i => i.id === item.id);
      if (idx >= 0) merged[idx].quantity += item.quantity;
      else merged.push(item);
    });
    return merged;
  };

  const saveCartToServer = async (items: CartItem[]) => {
    if (!isAuthenticated || !user) return;
    try {
      await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    if (isAuthenticated && user) {
      await saveCartToServer(items);
    } else {
      try {
        localStorage.setItem('gruhini_cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    const newItems = (() => {
      const existing = cartItems.find(i => i.id === item.id);
      if (existing) {
        toast({ title: "Item Updated", description: `${item.name} quantity increased.` });
        return cartItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        toast({ title: "Added to Cart", description: `${item.name} added.` });
        return [...cartItems, { ...item, quantity: 1 }];
      }
    })();

    setCartItems(newItems);
    await saveCart(newItems);
  };

  const removeFromCart = async (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      toast({ title: "Item Removed", description: `${item.name} removed.`, variant: "destructive" });
    }

    const updated = cartItems.filter(i => i.id !== id);
    setCartItems(updated);
    await saveCart(updated);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      await removeFromCart(id);
    } else {
      const updated = cartItems.map(i => i.id === id ? { ...i, quantity } : i);
      setCartItems(updated);
      await saveCart(updated);
      toast({ title: "Quantity Updated", description: `${item.name} → ${quantity}` });
    }
  };

  const clearCart = async () => {
    const count = cartItems.length;
    setCartItems([]);
    await saveCart([]);
    toast({ title: "Cart Cleared", description: `${count} item(s) removed.` });
  };

  const syncWithBackend = async () => {
    if (!isAuthenticated || !user) return;
    try {
      await saveCartToServer(cartItems);
      toast({ title: "Cart Synced", description: "Synced with server." });
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast({ title: "Sync Failed", description: "Could not sync with server.", variant: "destructive" });
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isLoading,
      syncWithBackend
    }}>
      {children}
    </CartContext.Provider>
  );
};
