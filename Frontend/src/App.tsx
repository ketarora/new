import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import PaymentPage from "./pages/Payment";
import OrderConfirmationPage from "./pages/OrderConfirmation";
import ExploreProducts from "./pages/ExploreProducts";
import CustomizeMeal from "./pages/CustomizeMeal";
import SuccessStories from "./pages/SuccessStories";
import RequestCustom from "./pages/RequestCustom";
import FestiveBooking from "./pages/FestiveBooking";
import TopSellersPage from "./pages/TopSellersPage";
import Leaderboard from "./pages/Leaderboard";
import UploadItems from "./pages/UploadItems";
import VoiceSearch from "./pages/VoiceSearch";
import SellerDashboard from "./pages/SellerDashboard";
import IntroLoader from "./components/IntroLoader";
import HelpCenter from "./pages/HelpCenter";
import ShippingInfo from "./pages/ShippingInfo";
import ReturnPolicy from "./pages/ReturnPolicy";
import ContactUs from "./pages/ContactUs";
import SellerSupport from "./pages/SellerSupport";
import SellerProfile from "./pages/SellerProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

import { decodeProductList } from './lib/product.client.js';
const response = await fetch('/get-all-products');
const bytes = new Uint8Array(await response.arrayBuffer());
const { products } = decodeProductList(bytes);













const queryClient = new QueryClient();

function Apps() {
  return (
    <div className="App">
      <AdminDashboard />
    </div>
  );
}

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroLoader onComplete={handleIntroComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/explore" element={<ExploreProducts />} />
              <Route path="/customize-meal" element={<CustomizeMeal />} />
              <Route path="/success-stories" element={<SuccessStories />} />
              <Route path="/request-custom" element={<RequestCustom />} />
              <Route path="/festive-booking" element={<FestiveBooking />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/upload-items" element={<UploadItems />} />
              <Route path="/voice-search" element={<VoiceSearch />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/shipping" element={<ShippingInfo />} />
              <Route path="/returns" element={<ReturnPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/seller-support" element={<SellerSupport />} />
              <Route path="/seller/:sellerId" element={<SellerProfile />} />
              <Route path="/top-sellers" element={<TopSellersPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/gruhani/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;