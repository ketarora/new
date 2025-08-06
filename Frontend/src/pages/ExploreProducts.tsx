import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Star, Clock, Truck, PlayCircle, ChevronDown, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { realSellers, getTopSellers } from "@/data/sellers";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { decodeProductList } from '@/lib/product.client';

interface MappedProduct {
  id: number;
  name: string;
  seller: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  deliveryTime: string;
  image: string;
  badge: string;
  verified: boolean;
  category: string;
  subcategory: string;
  description: string;
  kitchenVideoUrl?: string;
  stock: number;
}

const ExploreProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Homemade Food"]);
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const HEADER_HEIGHT_OFFSET = "72px";

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching products from backend...');

        // Update the URL to match your backend endpoint
        const response = await fetch("http://localhost:8085/get-all-products", {
          method: 'GET',
          headers: {
            "Accept": "application/x-protobuf",
            "Content-Type": "application/x-protobuf"
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        console.log('Received protobuf data, size:', bytes.length, 'bytes');

        // Decode the protobuf response
        const decoded = decodeProductList(bytes);
        console.log('Decoded products:', decoded.products.length);

        // Map protobuf products to frontend format
        const mapped: MappedProduct[] = decoded.products.map((p, index) => {
          console.log(`Processing product ${index + 1}:`, {
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            stock: p.stock
          });

          // Convert string price to display format
          const numericPrice = parseFloat(p.price) || 0;
          const formattedPrice = `₹${numericPrice.toFixed(2)}`;

          // Convert string id to number for frontend
          const numericId = parseInt(p.id) || index + 1;

          return {
            id: numericId,
            name: p.name || `Product ${numericId}`,
            seller: "Gruhini Seller", // You may need to get seller info from another API
            price: formattedPrice,
            originalPrice: undefined, // Not available in protobuf
            discount: undefined, // Not available in protobuf
            rating: p.rating || 0,
            deliveryTime: "2-3 days", // Default delivery time
            image: p.image || "/placeholder.svg",
            badge: p.badge || "",
            verified: p.verified || false,
            category: p.category || "Home Decor",
            subcategory: p.subcategory || "Herbal Soaps",
            description: p.description || "No description available",
            kitchenVideoUrl: undefined, // Not available in protobuf
            stock: p.stock || 0
          };
        });

        console.log('Mapped products for frontend:', mapped.length);
        setProducts(mapped);
      } catch (error) {
        console.error("Failed to fetch protobuf products:", error);

        // More detailed error logging
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('Network error - check if backend is running on http://localhost:8085');
        } else if (error instanceof Error && error.message.includes('HTTP error')) {
          console.error('Backend returned error response');
        } else {
          console.error('Protobuf decoding error:', error);
        }

        // Fallback to empty array on error
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const topSellerIds = useMemo(() => getTopSellers(realSellers), []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.seller.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.subcategory.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, selectedCategory, selectedSubcategory, searchTerm]);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory("");
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
  };

  // Fixed return statement for ExploreProducts component
  // Replace the return statement in your ExploreProducts.tsx (starting from line ~180)

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="container mx-auto px-4 py-6 flex-grow flex">
          {/* Left Panel: Categories with Subcategories */}
          <aside className="hidden md:block w-64 lg:w-72 pr-6">
            <div
              className="sticky overflow-y-auto h-[calc(100vh-var(--header-height)-2rem)] scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent"
              style={{ top: HEADER_HEIGHT_OFFSET, '--header-height': HEADER_HEIGHT_OFFSET } as React.CSSProperties}
            >
              <h2 className="text-xl font-semibold mb-4 text-ethnic-primary font-heading">Categories</h2>
              <nav className="flex flex-col space-y-1">
                {categories.map((category) => (
                  <div key={category.name}>
                    {category.subcategories.length > 0 ? (
                      <Collapsible
                        open={expandedCategories.includes(category.name)}
                        onOpenChange={() => toggleCategoryExpansion(category.name)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`flex items-center gap-2 whitespace-nowrap justify-between text-md px-3 py-2 h-auto w-full ${
                              selectedCategory === category.name ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                            }`}
                            onClick={() => handleCategorySelect(category.name)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              {category.name}
                            </div>
                            {expandedCategories.includes(category.name) ?
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-6 mt-1 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <Button
                              key={subcategory}
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-start text-sm px-3 py-1 h-auto ${
                                selectedSubcategory === subcategory ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/30"
                              }`}
                              onClick={() => handleSubcategorySelect(subcategory)}
                            >
                              {subcategory}
                            </Button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Button
                        variant={selectedCategory === category.name ? "default" : "ghost"}
                        className={`flex items-center gap-2 whitespace-nowrap justify-start text-md px-3 py-2 h-auto w-full ${
                          selectedCategory === category.name ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        }`}
                        onClick={() => handleCategorySelect(category.name)}
                      >
                        <span className="text-lg">{category.icon}</span>
                        {category.name}
                      </Button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Panel: Products and Filters */}
          <main className="flex-1 min-w-0">
            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products, sellers, or descriptions..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  Sort
                </Button>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="md:hidden flex overflow-x-auto gap-3 mb-6 pb-2 scrollbar-thin">
              {categories.map((category) => (
                <Button
                  key={`mobile-${category.name}`}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-1 h-auto"
                  onClick={() => handleCategorySelect(category.name)}
                >
                  <span className="text-md">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "All" || selectedSubcategory || searchTerm) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "All" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCategory}
                    <button onClick={() => handleCategorySelect("All")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedSubcategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedSubcategory}
                    <button onClick={() => setSelectedSubcategory("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedSubcategory && ` > ${selectedSubcategory}`}
              </p>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-2xl font-semibold text-muted-foreground mb-2">Loading products...</h3>
                <p className="text-sm text-muted-foreground">Fetching latest products from our sellers</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {products.length === 0
                    ? "Unable to load products from the backend. Please check if the server is running."
                    : "Try adjusting your filters or search terms."
                  }
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedSubcategory("");
                    setSearchTerm("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => {
                  const seller = realSellers.find(s => s.name === product.seller);
                  const isTopSeller = seller && topSellerIds.includes(seller.id);

                  return (
                    <Card key={product.id} className="group hover:shadow-warm transition-all duration-300 flex flex-col">
                      <CardContent className="p-0 flex flex-col flex-grow">
                        <div className="relative h-48 bg-gradient-to-br from-accent/20 to-primary/20 rounded-t-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          {product.badge && (
                            <div className="absolute top-3 left-3">
                              <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                                {product.badge}
                              </Badge>
                            </div>
                          )}
                          {product.verified && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="outline" className="bg-trust-green text-ethnic-primary border-0 text-xs px-2 py-1">
                                ✓ Gruhini Verified
                              </Badge>
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3">
                            <Badge variant="outline" className="bg-background/90 text-ethnic-primary border-0 text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {product.deliveryTime}
                            </Badge>
                          </div>
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute bottom-3 left-3">
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                Only {product.stock} left!
                              </Badge>
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-ethnic-primary mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Link to={`/seller/${product.seller.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors flex items-center gap-1">
                              by {product.seller}
                              {isTopSeller && (
                                <Star className="h-4 w-4 fill-amber-400 text-amber-500" title="Top Seller" />
                              )}
                            </Link>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-ethnic-primary">
                              {product.price}
                            </span>
                            {product.originalPrice && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.originalPrice}
                                </span>
                                <span className="text-sm text-primary font-medium">
                                  {product.discount}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 mt-auto pt-3">
                            <Button
                              variant="ethnic"
                              className="w-full"
                              disabled={product.stock === 0}
                            >
                              {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                            </Button>
                            {product.kitchenVideoUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-auto px-3"
                                onClick={() => console.log("View kitchen video:", product.kitchenVideoUrl)}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-8 bg-primary/10 rounded-lg p-4 flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-ethnic-primary">Get FREE delivery</p>
                <p className="text-sm text-muted-foreground">on your order above ₹199</p>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    );
}
export default  ExploreProducts;