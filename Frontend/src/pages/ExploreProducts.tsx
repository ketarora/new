import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Star, Clock, Truck, PlayCircle, ChevronDown, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { realProducts, categories } from "@/data/products";
import { realSellers, getTopSellers } from "@/data/sellers";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ExploreProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Homemade Food"]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const HEADER_HEIGHT_OFFSET = "72px";

  useEffect(() => {
      /*
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://grihini-wtbw.onrender.com/get-all-products");
        const data = await response.json();
        // Assume data is an array of products
        // Only keep approved products
        const approved = data.filter((p: any) => p.status === "approved");
        // Map backend fields to frontend structure
        const mapped = approved.map((p: any) => ({
          id: p.id || p._id || p.productId,
          name: p.name,
          seller: p.sellerName || (p.seller && (p.seller.name || p.seller.businessName)) || p.seller || "",
          price: p.price ? `₹${p.price}` : "",
          originalPrice: p.originalPrice ? `₹${p.originalPrice}` : undefined,
          discount: p.discount,
          rating: p.rating || 0,
          deliveryTime: p.deliveryTime || "",
          image: p.image || "/placeholder.svg",
          badge: p.badge || "",
          verified: p.verified || false,
          category: p.category || "",
          subcategory: p.subcategory || "",
          description: p.description || "",
          kitchenVideoUrl: p.kitchenVideoUrl || undefined,
          status: p.status,
        }));
        setProducts(mapped);
      } catch (e) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };*/
const fetchProducts = async () => {
  setIsLoading(true);
  try {
    const response = await fetch("http://localhost:8085/get-all-products", {
      headers: {
        "Accept": "application/x-protobuf"
      },
  credentials : 'include'
    });

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoded = ProductList.decode(bytes);

    const approved = decoded.products.filter((p: any) => p.status === "approved");

    const mapped = approved.map((p: any) => ({
      id: p.id,
      name: p.name,
      seller: "", // Update based on schema
      price: `₹${p.price}`,
      originalPrice: undefined,
      discount: undefined,
      rating: p.rating || 0,
      deliveryTime: "", // No such field in proto? leave blank or add it
      image: p.image || "/placeholder.svg",
      badge: p.badge || "",
      verified: p.verified || false,
      category: p.category || "",
      subcategory: p.subcategory || "",
      description: p.description || "",
      kitchenVideoUrl: undefined,
      status: "approved"
    }));

    setProducts(mapped);
  } catch (e) {
    console.error("Failed to fetch protobuf:", e);
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
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h3 className="text-2xl font-semibold text-muted-foreground mb-2">Loading products...</h3>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
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
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                            {product.badge}
                          </Badge>
                        </div>
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
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-ethnic-primary mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Link to={`/seller/${product.seller.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors flex items-center gap-1">
                            by {product.seller}
                            {(() => { const seller = realSellers.find(s => s.name === product.seller); const isTopSeller = seller && topSellerIds.includes(seller.id); return isTopSeller ? (<Star className="h-4 w-4 fill-amber-400 text-amber-500" title="Top Seller" />) : null; })()}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
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
                          <Button variant="ethnic" className="w-full">
                            ADD
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
};

export default ExploreProducts;