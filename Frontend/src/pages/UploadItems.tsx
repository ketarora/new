import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Product {
  name: string;
  price: number;
  image: string;
}

const UploadItems = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("https://grihini-wtbw.onrender.com/upload", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const products: Product[] = await response.json();
        setMatchedProducts(products);
        setIsPopupOpen(true);
        toast.success("Image uploaded and products matched successfully!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred while uploading the image.");
    }
  };

  const handleAddToCart = (product: Product) => {
    // In a real application, you would add the product to the cart here.
    // For this example, we'll just show a toast notification.
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Upload Your Grocery List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} className="w-full">
              Upload and Find Items
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matched Products</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedProducts.map((product) => (
              <Card key={product.name}>
                <img src={`/public/${product.image}`} alt={product.name} className="rounded-t-lg" />
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                  <Button onClick={() => handleAddToCart(product)} className="w-full mt-4">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadItems;