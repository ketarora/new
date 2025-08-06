// Complete protobuf decoder for ProductList - matches your backend schema exactly
// Replace your entire product.client.ts file with this code

export interface Product {
  id: string;          // String as per your protobuf schema
  name: string;
  description: string;
  price: string;       // String as per your protobuf schema
  rating: number;      // Float in protobuf
  verified: boolean;
  badge: string;
  category: string;
  subcategory: string;
  stock: number;       // int32 in protobuf
  image: string;
}

export interface ProductList {
  products: Product[];
}

// Main decoder function for ProductList
export function decodeProductList(bytes: Uint8Array): ProductList {
  const products: Product[] = [];
  let offset = 0;

  while (offset < bytes.length) {
    const { tag, wireType, value, newOffset } = readField(bytes, offset);

    if (tag === 1 && wireType === 2) { // products field (repeated)
      const productBytes = value as Uint8Array;
      const product = decodeProduct(productBytes);
      products.push(product);
    }

    offset = newOffset;
  }

  return { products };
}

// Decoder function for individual Product
function decodeProduct(bytes: Uint8Array): Product {
  const product: Partial<Product> = {};
  let offset = 0;

  while (offset < bytes.length) {
    const { tag, wireType, value, newOffset } = readField(bytes, offset);

    switch (tag) {
      case 1: // id (string)
        if (wireType === 2) product.id = decodeText(value as Uint8Array);
        break;
      case 2: // name (string)
        if (wireType === 2) product.name = decodeText(value as Uint8Array);
        break;
      case 3: // description (string)
        if (wireType === 2) product.description = decodeText(value as Uint8Array);
        break;
      case 4: // price (string)
        if (wireType === 2) product.price = decodeText(value as Uint8Array);
        break;
      case 5: // rating (float) - uses wire type 5 (32-bit)
        if (wireType === 5) product.rating = readFloat(value as Uint8Array);
        break;
      case 6: // verified (bool) - uses wire type 0 (varint)
        if (wireType === 0) product.verified = Boolean(value);
        break;
      case 7: // badge (string)
        if (wireType === 2) product.badge = decodeText(value as Uint8Array);
        break;
      case 8: // category (string)
        if (wireType === 2) product.category = decodeText(value as Uint8Array);
        break;
      case 9: // subcategory (string)
        if (wireType === 2) product.subcategory = decodeText(value as Uint8Array);
        break;
      case 10: // stock (int32) - uses wire type 0 (varint)
        if (wireType === 0) product.stock = value as number;
        break;
      case 11: // image (string)
        if (wireType === 2) product.image = decodeText(value as Uint8Array);
        break;
    }

    offset = newOffset;
  }

  // Return product with default values for missing fields
  return {
    id: product.id || '0',
    name: product.name || '',
    description: product.description || '',
    price: product.price || '0',
    rating: product.rating || 0,
    verified: product.verified || false,
    badge: product.badge || '',
    category: product.category || 'Home Decor',
    subcategory: product.subcategory || 'Herbal Soaps',
    stock: product.stock || 0,
    image: product.image || '/placeholder.svg'
  };
}

// Helper function to decode UTF-8 text from bytes
function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    console.warn('Failed to decode text:', error);
    return '';
  }
}

// Core protobuf field reading function
function readField(bytes: Uint8Array, offset: number): {
  tag: number;
  wireType: number;
  value: number | Uint8Array;
  newOffset: number;
} {
  const { value: tagAndWireType, newOffset: afterTag } = readVarint(bytes, offset);
  const tag = tagAndWireType >> 3;
  const wireType = tagAndWireType & 0x7;

  let value: number | Uint8Array;
  let newOffset: number;

  switch (wireType) {
    case 0: // Varint (int32, int64, uint32, uint64, sint32, sint64, bool, enum)
      ({ value, newOffset } = readVarint(bytes, afterTag));
      break;
    case 1: // 64-bit (fixed64, sfixed64, double)
      if (afterTag + 8 > bytes.length) {
        throw new Error('Not enough bytes for 64-bit value');
      }
      value = bytes.slice(afterTag, afterTag + 8);
      newOffset = afterTag + 8;
      break;
    case 2: // Length-delimited (string, bytes, embedded messages, packed repeated fields)
      const { value: length, newOffset: afterLength } = readVarint(bytes, afterTag);
      if (afterLength + length > bytes.length) {
        throw new Error(`Not enough bytes for length-delimited value. Expected ${length} bytes`);
      }
      value = bytes.slice(afterLength, afterLength + length);
      newOffset = afterLength + length;
      break;
    case 5: // 32-bit (fixed32, sfixed32, float)
      if (afterTag + 4 > bytes.length) {
        throw new Error('Not enough bytes for 32-bit value');
      }
      value = bytes.slice(afterTag, afterTag + 4);
      newOffset = afterTag + 4;
      break;
    default:
      throw new Error(`Unsupported wire type: ${wireType}. Valid protobuf wire types are 0, 1, 2, and 5.`);
  }

  return { tag, wireType, value, newOffset };
}

// Read variable-length integer (varint)
function readVarint(bytes: Uint8Array, offset: number): { value: number; newOffset: number } {
  let value = 0;
  let shift = 0;
  let newOffset = offset;

  while (newOffset < bytes.length) {
    const byte = bytes[newOffset++];
    value |= (byte & 0x7F) << shift;

    // If the MSB is not set, this is the last byte
    if ((byte & 0x80) === 0) {
      break;
    }

    shift += 7;

    // Prevent infinite loops and overflow
    if (shift >= 64) {
      throw new Error('Invalid varint: too many bytes');
    }
  }

  return { value, newOffset };
}

// Read 32-bit float from bytes
function readFloat(bytes: Uint8Array): number {
  if (bytes.length !== 4) {
    console.warn(`Invalid float bytes length: ${bytes.length}, expected 4`);
    return 0;
  }

  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, 4);
    return view.getFloat32(0, true); // little endian
  } catch (error) {
    console.warn('Failed to read float:', error);
    return 0;
  }
}

// Read 64-bit double from bytes (if needed in future)
function readDouble(bytes: Uint8Array): number {
  if (bytes.length !== 8) {
    console.warn(`Invalid double bytes length: ${bytes.length}, expected 8`);
    return 0;
  }

  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, 8);
    return view.getFloat64(0, true); // little endian
  } catch (error) {
    console.warn('Failed to read double:', error);
    return 0;
  }
}