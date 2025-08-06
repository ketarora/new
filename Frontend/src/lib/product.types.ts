// TypeScript interfaces generated from protobuf - Updated to match your backend schema
// Replace your entire products.type.ts file with this code

export interface IProducto {
  id?: string;        // String as per your protobuf schema
  name?: string;
  description?: string;
  price?: string;     // String as per your protobuf schema
  rating?: number;    // Float in protobuf
  verified?: boolean;
  badge?: string;
  category?: string;
  subcategory?: string;
  stock?: number;     // int32 in protobuf
  image?: string;
}

export interface IProductList {
  products?: IProducto[];
}

// Helper class for working with products
export class ProductHelper {
  static createProduct(data: Partial<IProducto>): IProducto {
    return {
      id: data.id || '0',
      name: data.name || '',
      description: data.description || '',
      price: data.price || '0',
      rating: data.rating || 0,
      verified: data.verified || false,
      badge: data.badge || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      stock: data.stock || 0,
      image: data.image || ''
    };
  }

  static createProductList(products: IProducto[]): IProductList {
    return { products };
  }

  static validateProduct(product: any): product is IProducto {
    return (
      typeof product === 'object' &&
      product !== null &&
      (typeof product.id === 'string' || product.id === undefined) &&
      (typeof product.name === 'string' || product.name === undefined) &&
      (typeof product.description === 'string' || product.description === undefined) &&
      (typeof product.price === 'string' || product.price === undefined) &&
      (typeof product.rating === 'number' || product.rating === undefined) &&
      (typeof product.verified === 'boolean' || product.verified === undefined) &&
      (typeof product.badge === 'string' || product.badge === undefined) &&
      (typeof product.category === 'string' || product.category === undefined) &&
      (typeof product.subcategory === 'string' || product.subcategory === undefined) &&
      (typeof product.stock === 'number' || product.stock === undefined) &&
      (typeof product.image === 'string' || product.image === undefined)
    );
  }

  // Utility method to convert protobuf product to display format
  static formatProductForDisplay(product: IProducto): {
    id: number;
    name: string;
    price: string;
    formattedPrice: string;
    numericPrice: number;
  } {
    const numericId = parseInt(product.id || '0') || 0;
    const numericPrice = parseFloat(product.price || '0') || 0;
    const formattedPrice = `₹${numericPrice.toFixed(2)}`;

    return {
      id: numericId,
      name: product.name || `Product ${numericId}`,
      price: product.price || '0',
      formattedPrice,
      numericPrice
    };
  }

  // Utility method to validate protobuf response
  static validateProductList(data: any): data is IProductList {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.products) &&
      data.products.every((product: any) => ProductHelper.validateProduct(product))
    );
  }
}