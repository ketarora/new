export function decodeProductList(bytes) {
  const products = [];
  let offset = 0;

  while (offset < bytes.length) {
    const { tag, wireType, value, newOffset } = readField(bytes, offset);

    if (tag === 1 && wireType === 2) {
      const productBytes = value;
      const product = decodeProduct(productBytes);
      products.push(product);
    }

    offset = newOffset;
  }

  return { products };
}

function decodeProduct(bytes) {
  const product = {};
  let offset = 0;

  while (offset < bytes.length) {
    const { tag, wireType, value, newOffset } = readField(bytes, offset);

    switch (tag) {
      case 1: product.id = value; break;
      case 2: product.name = decodeText(value); break;
      case 3: product.description = decodeText(value); break;
      case 4: product.price = readDouble(value); break;
      case 5: product.rating = readDouble(value); break;
      case 6: product.verified = Boolean(value); break;
      case 7: product.badge = decodeText(value); break;
      case 8: product.category = decodeText(value); break;
      case 9: product.subcategory = decodeText(value); break;
      case 10: product.stock = value; break;
      case 11: product.image = decodeText(value); break;
    }

    offset = newOffset;
  }

  return {
    id: product.id || 0,
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    rating: product.rating || 0,
    verified: product.verified || false,
    badge: product.badge || '',
    category: product.category || 'Home Decor',
    subcategory: product.subcategory || 'Herbal Soaps',
    stock: product.stock || 0,
    image: product.image || '/placeholder.svg'
  };
}

function decodeText(value) {
  return value instanceof Uint8Array
    ? new TextDecoder().decode(value)
    : '';
}

function readField(bytes, offset) {
  const { value: tagAndWire, newOffset: afterTag } = readVarint(bytes, offset);
  const tag = tagAndWire >> 3;
  const wireType = tagAndWire & 0x07;

  let value;
  let newOffset;

  switch (wireType) {
    case 0: // varint
      ({ value, newOffset } = readVarint(bytes, afterTag));
      break;
    case 1: // 64-bit
      value = bytes.slice(afterTag, afterTag + 8);
      newOffset = afterTag + 8;
      break;
    case 2: // length-delimited
      const { value: len, newOffset: afterLen } = readVarint(bytes, afterTag);
      value = bytes.slice(afterLen, afterLen + len);
      newOffset = afterLen + len;
      break;
    case 5: // 32-bit
      value = bytes.slice(afterTag, afterTag + 4);
      newOffset = afterTag + 4;
      break;
    default:
      throw new Error(`Unsupported wire type ${wireType}`);
  }

  return { tag, wireType, value, newOffset };
}

function readVarint(bytes, offset) {
  let result = 0;
  let shift = 0;
  let pos = offset;

  while (true) {
    const byte = bytes[pos++];
    result |= (byte & 0x7F) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }

  return { value: result, newOffset: pos };
}

function readDouble(bytes) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  bytes.forEach((b, i) => view.setUint8(i, b));
  return view.getFloat64(0, true);
}
