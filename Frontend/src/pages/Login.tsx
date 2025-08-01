import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Tag, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Customer Login State
  const [customerData, setCustomerData] = useState({
    email: '',
    password: '',
    userType: 'customer' // New field for user type
  });

  // Seller Registration State
  const [sellerData, setSellerData] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    categories: [] as string[],
    whatsapp: ''
  });

  const categories = [
    'Homemade Food',
    'Natural Cosmetics',
    'Handmade Crafts',
    'Pickles & Condiments',
    'Sweets & Desserts',
    'Fresh Vegetables',
    'Dairy Products',
    'Spices & Masalas',
    'Baked Goods',
    'Traditional Snacks'
  ];

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.email || !customerData.password || !customerData.userType) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Single endpoint for all user types - userType is sent to backend
      const response = await fetch(`https://grihini-wtbw.onrender.com/logins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         credentials: 'include',
        body: JSON.stringify({
          email: customerData.email,
          password: customerData.password,
          userType: customerData.userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        login(data.user, data.token);
        toast.success('Login successful!');

        // Navigate based on user type
        if (customerData.userType === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component code...


  const handleSellerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (sellerData.categories.length === 0) {
      toast.error('Please select at least one category');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerData.email)) {
      toast.error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
        console.log("Sending data", sellerData);

      const response = await fetch('https://grihini-wtbw.onrender.com/register-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone,
          businessName: sellerData.businessName,
          categories: sellerData.categories,
          // You might want to add address field to the form
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Simulate WhatsApp message sending
        setTimeout(() => {
          const whatsappMessage = `🎉 Welcome to गृहिणी Family!

Dear ${sellerData.name},

Thank you for registering as a seller with us!

📋 Your Details:
• Name: ${sellerData.name}
• Business: ${sellerData.businessName}
• Categories: ${sellerData.categories.join(', ')}
• Email: ${sellerData.email}
• Phone: ${sellerData.phone}

📸 Next Steps:
1. Please send us photos of your products
2. Include product names and prices
3. Our team will review and approve your items
4. Once approved, your products will go live!

📱 Send your product photos to this WhatsApp number with:
- Product name
- Price
- Brief description
- High-quality images

We'll review and get back to you within 24 hours!

Welcome aboard! 🚀

Team गृहिणी`;

          // In a real app, this would send actual WhatsApp message
          console.log('WhatsApp Message:', whatsappMessage);

          toast.success('Registration successful! WhatsApp message sent with next steps.');

          // Auto-login the seller after registration
          login({
            ...data.user,
            userType: 'seller'
          });

          // Reset form
          setSellerData({
            name: '',
            phone: '',
            email: '',
            businessName: '',
            categories: [],
            whatsapp: ''
          });

          // Redirect to seller dashboard
          navigate('/login');
        }, 1000);
      } else {
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSellerData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-trust-green rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/gruhani-logo.jpg" alt="गृहिणी Logo" className="h-20 w-20 mx-auto rounded-full shadow-xl border-4 border-white" />
          <h1 className="text-3xl font-heading font-bold text-ethnic-primary mt-4">गृहिणी</h1>
          <p className="text-muted-foreground">घर का स्वाद</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-heading text-ethnic-primary">Welcome Back</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="seller" className="text-sm">Become Seller</TabsTrigger>
              </TabsList>

              {/* Customer/Seller Login */}
              <TabsContent value="customer">
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  {/* Google Sign In */}
                  <Button variant="outline" className="w-full" type="button">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* User Type Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="user-type">Login As</Label>
                      <Select
                        value={customerData.userType}
                        onValueChange={(value) => setCustomerData(prev => ({ ...prev, userType: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center">
                            <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select user type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              <span>Customer</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="seller">
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4" />
                              <span>Seller</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={customerData.email}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={customerData.password}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : `Sign In as ${customerData.userType === 'seller' ? 'Seller' : 'Customer'}`}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </form>
              </TabsContent>

              {/* Seller Registration */}
              <TabsContent value="seller">
                <form onSubmit={handleSellerRegistration} className="space-y-4">
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="bg-trust-green/20 text-ethnic-primary border-trust-green">
                      👩‍🍳 Join as Seller
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seller-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="seller-name"
                          placeholder="Your name"
                          className="pl-10"
                          value={sellerData.name}
                          onChange={(e) => setSellerData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seller-phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="seller-phone"
                          placeholder="+91 XXXXX XXXXX"
                          className="pl-10"
                          value={sellerData.phone}
                          onChange={(e) => setSellerData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="seller-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={sellerData.email}
                        onChange={(e) => setSellerData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business/Enterprise Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="business-name"
                        placeholder="e.g., Sunita's Kitchen"
                        className="pl-10"
                        value={sellerData.businessName}
                        onChange={(e) => setSellerData(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categories You Serve *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={sellerData.categories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`category-${category}`} className="text-xs cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selected: {sellerData.categories.length} categories
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register as Seller'}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>✅ After registration, you'll receive WhatsApp instructions</p>
                    <p>📸 Send product photos with names & prices</p>
                    <p>⏱️ Get approved within 24 hours</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;