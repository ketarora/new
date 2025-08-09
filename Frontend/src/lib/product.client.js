// CommonJS protobuf decoder for ProductList.
// Exports decodeProductList function using module.exports.

function decodeProductList(bytes) {
  const products = [];

  if (bytes.length === 0) {
    console.warn('Empty byte array received');
    return { products: [] };
  }

  try {
    let offset = 0;
    let productCount = 0;

    while (offset < bytes.length && productCount < 1000) {
      const fieldResult = readFieldRobust(bytes, offset);
      if (!fieldResult) {
        break;
      }

      const { tag, wireType, value, newOffset } = fieldResult;

      if (tag === 1 && wireType === 2 && value instanceof Uint8Array) {
        const product = decodeProductRobust(value);
        if (product) {
          products.push(product);
          productCount++;
        }
      }

      offset = newOffset;

      if (newOffset <= offset) {
        break;
      }
    }
  } catch (error) {
    console.error('Critical error in decodeProductList:', error);
  }

  return { products };
}

function decodeProductRobust(bytes) {
  const product = {};
  let offset = 0;

  try {
    let fieldCount = 0;

    while (offset < bytes.length && fieldCount < 50) {
      const fieldResult = readFieldRobust(bytes, offset);
      if (!fieldResult) {
        break;
      }

      const { tag, wireType, value, newOffset } = fieldResult;

      switch (tag) {
        case 1:
          product.id = decodeStringField(value, wireType);
          break;
        case 2:
          product.name = decodeStringField(value, wireType);
          break;
        case 3:
          product.description = decodeStringField(value, wireType);
          break;
        case 4:
          product.price = decodeStringField(value, wireType);
          break;
        case 5:
          product.rating = decodeFloatField(value, wireType);
          break;
        case 6:
          product.verified = decodeBoolField(value, wireType);
          break;
        case 7:
          product.badge = decodeStringField(value, wireType);
          break;
        case 8:
          product.category = decodeStringField(value, wireType);
          break;
        case 9:
          product.subcategory = decodeStringField(value, wireType);
          break;
        case 10:
          product.stock = decodeIntField(value, wireType);
          break;
        case 11:
          product.image = decodeStringField(value, wireType);
          break;
        default:
          break;
      }

      offset = newOffset;
      fieldCount++;

      if (newOffset <= offset) {
        break;
      }
    }

    return {
      id: product.id || '0',
      name: product.name || 'Unknown Product',
      description: product.description || 'No description available',
      price: product.price || '0',
      rating: product.rating || 0,
      verified: product.verified || false,
      badge: product.badge || '',
      category: product.category || 'Home Decor',
      subcategory: product.subcategory || 'Herbal Soaps',
      stock: product.stock || 0,
      image: product.image || '/placeholder.svg'
    };
  } catch (error) {
    console.error('Error decoding product:', error);
    return null;
  }
}

function readFieldRobust(bytes, offset) {
  if (offset >= bytes.length) {
    return null;
  }

  const varintResult = readVarintRobust(bytes, offset);
  if (!varintResult) {
    return null;
  }

  const tagAndWireType = varintResult.value;
  const afterTag = varintResult.newOffset;
  const tag = tagAndWireType >> 3;
  const wireType = tagAndWireType & 0x7;

  if (![0, 1, 2, 3, 4, 5].includes(wireType)) {
    return readFieldRobust(bytes, offset + 1);
  }

  let value;
  let newOffset;

  switch (wireType) {
    case 0:
      const varintValue = readVarintRobust(bytes, afterTag);
      if (!varintValue) return null;
      value = varintValue.value;
      newOffset = varintValue.newOffset;
      break;
    case 1:
      if (afterTag + 8 > bytes.length) return null;
      value = bytes.slice(afterTag, afterTag + 8);
      newOffset = afterTag + 8;
      break;
    case 2:
      const lengthResult = readVarintRobust(bytes, afterTag);
      if (!lengthResult) return null;
      const length = lengthResult.value;
      const afterLength = lengthResult.newOffset;
      if (afterLength + length > bytes.length) return null;
      value = bytes.slice(afterLength, afterLength + length);
      newOffset = afterLength + length;
      break;
    case 3:
      let groupDepth = 1;
      newOffset = afterTag;
      while (newOffset < bytes.length && groupDepth > 0) {
        const nextField = readVarintRobust(bytes, newOffset);
        if (!nextField) break;
        const nextWireType = nextField.value & 0x7;
        if (nextWireType === 3) groupDepth++;
        else if (nextWireType === 4) groupDepth--;
        newOffset = nextField.newOffset;
      }
      value = new Uint8Array(0);
      break;
    case 4:
      value = new Uint8Array(0);
      newOffset = afterTag;
      break;
    case 5:
      if (afterTag + 4 > bytes.length) return null;
      value = bytes.slice(afterTag, afterTag + 4);
      newOffset = afterTag + 4;
      break;
    default:
      return null;
  }

  return { tag, wireType, value, newOffset };
}

function readVarintRobust(bytes, offset) {
  let value = 0;
  let shift = 0;
  let newOffset = offset;

  while (newOffset < bytes.length) {
    const byte = bytes[newOffset++];
    value |= (byte & 0x7F) << shift;

    if ((byte & 0x80) === 0) {
      break;
    }

    shift += 7;
    if (shift >= 64) {
      return null;
    }
  }

  return { value, newOffset };
}

function decodeStringField(value, wireType) {
  if (wireType === 2 && value instanceof Uint8Array) {
    return new TextDecoder('utf-8').decode(value);
  } else if (wireType === 0) {
    return String(value);
  }
  return '';
}

function decodeFloatField(value, wireType) {
  if (wireType === 5 && value instanceof Uint8Array && value.length === 4) {
    const view = new DataView(value.buffer, value.byteOffset, 4);
    return view.getFloat32(0, true);
  } else if (wireType === 1 && value instanceof Uint8Array && value.length === 8) {
    const view = new DataView(value.buffer, value.byteOffset, 8);
    return view.getFloat64(0, true);
  } else if (wireType === 0) {
    return Number(value);
  }
  return 0;
}

function decodeBoolField(value, wireType) {
  if (wireType === 0) {
    return Boolean(value);
  }
  return false;
}

function decodeIntField(value, wireType) {
  if (wireType === 0) {
    return Number(value);
  }
  return 0;
}

module.exports = {
  decodeProductList,
};
</create_file>