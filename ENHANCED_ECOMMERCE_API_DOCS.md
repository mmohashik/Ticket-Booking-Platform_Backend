# 🛒 Enhanced E-commerce Backend API Documentation
*Updated for Frontend Cart & Checkout Features*

## 📋 Summary of Backend Enhancements

Based on your frontend changes, I've enhanced the ecommerce backend with the following improvements:

### ✅ What's Already Working (No Changes Needed)
- Product fetching and display ✅
- Basic cart functionality ✅  
- Checkout payment processing ✅
- Stock quantity display ✅
- Size Chart (purely frontend) ✅

### 🔧 New Backend Enhancements Added

#### 1. **Enhanced Stock Validation APIs**
- Real-time stock checking before adding to cart
- Cart-wide stock validation
- Better stock status messages

#### 2. **Improved Product Endpoints**
- Products now include detailed stock information
- Stock status indicators for frontend display
- Size availability per product

#### 3. **Enhanced Order Processing**
- Pre-order validation endpoint
- Better error messages for stock issues
- Improved checkout flow support

---

## 🚀 New API Endpoints

### **Stock Validation**

#### Check Stock Availability
```http
POST /api/stock/check-stock/:productId
Authorization: Bearer {token}
Content-Type: application/json

{
  "requestedQuantity": 5,
  "size": "M"  // optional
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "productId": "64a7b8...",
    "size": "M",
    "availableStock": 10,
    "requestedQuantity": 5,
    "isAvailable": true,
    "message": "Stock available",
    "stockDetails": [
      {
        "stockId": "64a7b9...",
        "size": "M",
        "quantity": 10,
        "price": 25.99
      }
    ]
  }
}
```

#### Validate Cart Items
```http
POST /api/stock/validate-cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "64a7b8...",
      "size": "M",
      "quantity": 2
    },
    {
      "productId": "64a7b9...", 
      "size": "L",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "allValid": true,
    "items": [
      {
        "productId": "64a7b8...",
        "productName": "Cool T-Shirt",
        "size": "M",
        "requestedQuantity": 2,
        "availableStock": 10,
        "isValid": true,
        "message": "Stock available"
      }
    ],
    "message": "All items are available"
  }
}
```

#### Get Size Chart
```http
GET /api/stock/size-chart
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "measurements": {
      "M": {
        "chest": "38-40",
        "length": "28",
        "shoulder": "17"
      }
    },
    "unit": "inches",
    "tips": [
      "Measurements are in inches",
      "Chest: Measure around the fullest part of your chest"
    ]
  }
}
```

### **Enhanced Product Endpoints**

#### Get All Products (Enhanced)
```http
GET /api/products/all-products
Authorization: Bearer {token}
```

**Response:** (Now includes stock information)
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "_id": "64a7b8...",
      "name": "Cool T-Shirt",
      "description": "Comfortable cotton t-shirt",
      "category": {...},
      "images": ["http://..."],
      "stockInfo": {
        "totalQuantity": 25,
        "availableSizes": ["S", "M", "L", "XL"],
        "priceRange": { "min": 19.99, "max": 25.99 },
        "stockStatus": "in-stock",
        "stockMessage": "25 available",
        "isInStock": true
      },
      "stocks": [
        {
          "id": "64a7b9...",
          "size": "M",
          "quantity": 10,
          "price": 25.99,
          "supplier": "Supplier ABC"
        }
      ]
    }
  ]
}
```

#### Get Product by ID (Enhanced)
```http
GET /api/products/product/:id
Authorization: Bearer {token}
```

**Response:** (Similar to above but for single product with more detailed stock info)

### **Order Validation**

#### Validate Order Before Processing
```http
POST /api/orders/validate-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "64a7ba...",
  "items": [
    {
      "stock": "64a7bb...",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "customer": {
      "id": "64a7ba...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "stockId": "64a7bb...",
        "productName": "Cool T-Shirt",
        "size": "M",
        "requestedQuantity": 2,
        "availableStock": 10,
        "pricePerItem": 25.99,
        "itemTotal": 51.98,
        "isValid": true,
        "message": "Available"
      }
    ],
    "totalAmount": 51.98,
    "isValid": true,
    "message": "Order can be processed"
  }
}
```

---

## 📱 Frontend Integration Examples

### **1. Stock Validation Before Adding to Cart**

```javascript
const validateStock = async (productId, size, quantity) => {
  try {
    const response = await fetch(`/api/stock/check-stock/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requestedQuantity: quantity,
        size: size
      })
    });
    
    const result = await response.json();
    return result.data.isAvailable;
  } catch (error) {
    console.error('Stock validation failed:', error);
    return false;
  }
};

// Usage in your cart logic
const addToCart = async (product, size, quantity) => {
  const isAvailable = await validateStock(product.id, size, quantity);
  
  if (isAvailable) {
    // Add to cart
    addItemToCart({ product, size, quantity });
    showSuccess('Added to cart successfully!');
  } else {
    showError('Insufficient stock available');
  }
};
```

### **2. Real-time Cart Validation on Checkout**

```javascript
const validateCartBeforeCheckout = async (cartItems) => {
  try {
    const response = await fetch('/api/stock/validate-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity
        }))
      })
    });
    
    const result = await response.json();
    
    if (!result.data.allValid) {
      // Show specific errors for each item
      result.data.items
        .filter(item => !item.isValid)
        .forEach(item => {
          showError(`${item.productName} (${item.size}): ${item.message}`);
        });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Cart validation failed:', error);
    return false;
  }
};
```

### **3. Enhanced Stock Display**

```javascript
const displayStockStatus = (stockInfo) => {
  const { stockStatus, stockMessage, isInStock } = stockInfo;
  
  let className = '';
  let displayText = stockMessage;
  
  switch (stockStatus) {
    case 'out-of-stock':
      className = 'text-red-500';
      displayText = 'Out of stock';
      break;
    case 'low-stock':
      className = 'text-orange-500';
      displayText = stockMessage; // "Only 5 left"
      break;
    case 'medium-stock':
      className = 'text-yellow-500';
      displayText = stockMessage; // "15 left"
      break;
    case 'in-stock':
      className = 'text-green-500';
      displayText = 'In stock';
      break;
  }
  
  return `<span class="${className}">${displayText}</span>`;
};
```

---

## 🔧 Key Backend Validations Now in Place

### **1. Stock Validation**
- ✅ Prevents overselling
- ✅ Real-time availability checks
- ✅ Size-specific stock validation
- ✅ Batch stock checking for carts

### **2. Order Processing**
- ✅ Pre-order validation
- ✅ Stock deduction with transactions
- ✅ Automatic low-stock alerts
- ✅ Detailed error messages

### **3. Data Consistency**
- ✅ Atomic operations for stock changes
- ✅ Rollback on failures
- ✅ Consistent stock status across requests

---

## 🚨 Important Notes for Frontend Team

### **✅ What's Ready to Use**
1. **Enhanced product data** - All products now include stock info
2. **Stock validation APIs** - Use before adding to cart and checkout
3. **Size chart endpoint** - Optional, can still use frontend-only approach
4. **Order validation** - Use before final order submission

### **⚠️ Things to Monitor**
1. **API calls** - New endpoints require authentication
2. **Error handling** - Enhanced error messages for better UX
3. **Stock status** - Use the enhanced stock status for display
4. **Performance** - Stock validation adds small API overhead

### **🔄 Migration Path**
1. **Current code** - Will continue to work without changes
2. **Gradual enhancement** - Add new validations incrementally  
3. **Error fallbacks** - Current error handling will still work
4. **Performance** - New features are optional and won't slow existing flows

---

## 🎯 Summary

Your backend now fully supports your enhanced frontend cart and checkout system! The key improvements are:

✅ **Real-time stock validation** - Prevent overselling  
✅ **Enhanced product data** - Better stock information for display  
✅ **Cart validation** - Validate entire cart before checkout  
✅ **Improved checkout** - Pre-validate orders before processing  
✅ **Better error messages** - Clear feedback for users  

The existing API endpoints continue to work, and these enhancements are additive - you can implement them gradually as needed.

**Ready to go! 🚀**
