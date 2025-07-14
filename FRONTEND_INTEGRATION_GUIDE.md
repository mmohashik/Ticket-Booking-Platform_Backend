# 🚀 **FRONTEND INTEGRATION GUIDE**
*E-Commerce Backend with Stripe Payment Integration*

## 📋 **OVERVIEW FOR FRONTEND TEAM**

Your backend is ready with complete e-commerce functionality including Stripe payment processing. This guide provides everything the frontend team needs to integrate.

---

## 🔑 **STRIPE KEYS SETUP**

### **Current Status:**
- ✅ **Stripe Package**: Installed and configured
- ✅ **Test Keys**: Currently using placeholder test keys
- ✅ **Configuration Endpoint**: Ready to provide keys to frontend

### **What Frontend Needs:**

#### **1. Install Stripe Packages:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### **2. Get Stripe Configuration from Backend:**
```javascript
// Frontend code to get Stripe keys
const getStripeConfig = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/ecom/payments/config');
    const result = await response.json();
    return result.data.publishableKey;
  } catch (error) {
    console.error('Failed to get Stripe config:', error);
    throw error;
  }
};
```

---

## 🌐 **API ENDPOINTS FOR FRONTEND**

### **Base URL:** `http://localhost:3000/api/ecom`

### **🏷️ PRODUCT MANAGEMENT**

#### **Get All Products**
```javascript
GET /api/ecom/products
Response: {
  "status": "SUCCESS",
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "productCode": "CAT001",
      "description": "Product description",
      "category": {
        "_id": "category_id",
        "name": "Category Name"
      },
      "price": 29.99,
      "quantity": 100,
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Red", "Blue", "Green"],
      "images": ["http://localhost:3000/uploads/ecom/image.jpg"],
      "isActive": true
    }
  ]
}
```

#### **Get Single Product**
```javascript
GET /api/ecom/products/:id
```

#### **Check Stock Availability**
```javascript
POST /api/ecom/products/:id/check-stock
Body: {
  "requestedQuantity": 2
}

Response: {
  "status": "SUCCESS",
  "data": {
    "availableStock": 10,
    "requestedQuantity": 2,
    "isAvailable": true,
    "message": "Stock available"
  }
}
```

### **🛒 CART & CHECKOUT FLOW**

#### **Step 1: Create Payment Intent**
```javascript
POST /api/ecom/payments/create-payment-intent
Content-Type: application/json

Body: {
  "cartItems": [
    {
      "productId": "product_id",
      "quantity": 2,
      "size": "M",
      "color": "Red"
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    }
  },
  "shipping": 10.00,
  "tax": 5.50
}

Response: {
  "status": "SUCCESS",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "orderId": "order_id",
    "orderNumber": "ORD-1752416745-0001",
    "total": 75.50,
    "subtotal": 60.00,
    "tax": 5.50,
    "shipping": 10.00
  }
}
```

#### **Step 2: Process Payment with Stripe (Frontend)**
```javascript
// After getting clientSecret, use Stripe to confirm payment
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: elements.getElement(CardElement),
    billing_details: {
      name: customerInfo.name,
      email: customerInfo.email
    }
  }
});
```

#### **Step 3: Confirm Payment with Backend**
```javascript
POST /api/ecom/payments/confirm-payment
Body: {
  "paymentIntentId": "pi_xxx"
}

Response: {
  "status": "SUCCESS",
  "message": "Payment confirmed and order completed",
  "data": {
    "orderId": "order_id",
    "orderNumber": "ORD-1752416745-0001",
    "paymentStatus": "succeeded",
    "orderStatus": "confirmed"
  }
}
```

### **📋 ORDER TRACKING**

#### **Get Order by ID**
```javascript
GET /api/ecom/payments/order/:orderId
```

#### **Get Order by Order Number**
```javascript
GET /api/ecom/payments/order-number/:orderNumber
```

---

## 🎨 **FRONTEND IMPLEMENTATION EXAMPLES**

### **1. Product Display Component**
```javascript
// ProductCard.jsx
import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    // Check stock first
    const stockResponse = await fetch(`/api/ecom/products/${product._id}/check-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedQuantity: quantity })
    });
    
    const stockResult = await stockResponse.json();
    
    if (stockResult.data.isAvailable) {
      onAddToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
        image: product.images[0]
      });
    } else {
      alert(stockResult.data.message);
    }
  };

  return (
    <div className="product-card">
      <img src={product.images[0]} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      
      <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
        {product.sizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
        {product.colors.map(color => (
          <option key={color} value={color}>{color}</option>
        ))}
      </select>
      
      <input 
        type="number" 
        min="1" 
        max={product.quantity}
        value={quantity} 
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};
```

### **2. Cart Management**
```javascript
// CartContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingIndex = state.findIndex(
        item => item.productId === action.payload.productId && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      );
      
      if (existingIndex >= 0) {
        const newState = [...state];
        newState[existingIndex].quantity += action.payload.quantity;
        return newState;
      } else {
        return [...state, action.payload];
      }
      
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload.id);
      
    case 'UPDATE_QUANTITY':
      return state.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
    case 'CLEAR_CART':
      return [];
      
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  
  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id: Date.now() } });
  };
  
  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

### **3. Complete Checkout Flow**
```javascript
// CheckoutPage.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from './CartContext';

// Load Stripe
const stripePromise = fetch('/api/ecom/payments/config')
  .then(res => res.json())
  .then(data => loadStripe(data.data.publishableKey));

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart, total } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create Payment Intent
      const paymentResponse = await fetch('/api/ecom/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          })),
          customerInfo,
          shipping: 10.00,
          tax: total * 0.08
        })
      });

      const paymentResult = await paymentResponse.json();
      
      if (paymentResult.status !== 'SUCCESS') {
        throw new Error(paymentResult.message);
      }

      // Step 2: Confirm Payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentResult.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address.street,
                city: customerInfo.address.city,
                state: customerInfo.address.state,
                postal_code: customerInfo.address.zipCode,
                country: customerInfo.address.country
              }
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Confirm with Backend
      const confirmResponse = await fetch('/api/ecom/payments/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id })
      });

      const confirmResult = await confirmResponse.json();
      
      if (confirmResult.status === 'SUCCESS') {
        clearCart();
        // Redirect to success page
        window.location.href = `/order-success/${confirmResult.data.orderNumber}`;
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Customer Info Form */}
      <div>
        <h3>Shipping Information</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
          required
        />
        {/* Add more address fields */}
      </div>

      {/* Order Summary */}
      <div>
        <h3>Order Summary</h3>
        {cart.map(item => (
          <div key={item.id}>
            {item.name} - {item.size} - {item.color} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
          </div>
        ))}
        <div>Total: ${total.toFixed(2)}</div>
      </div>

      {/* Payment */}
      <div>
        <h3>Payment Information</h3>
        <CardElement />
      </div>

      {error && <div style={{color: 'red'}}>{error}</div>}

      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
```

---

## 🔑 **STRIPE KEYS MANAGEMENT**

### **For Development:**
```javascript
// Your current test keys (safe to share with frontend team)
STRIPE_PUBLISHABLE_KEY=pk_test_51RflZsH8Y4NurIed35nhMOXlcQdl8A0TJTO9TIjltIGnKdsnDDBAVRlZ0PF1Ez3Ocr4Q5Y2Tmke0hRLUzX3Fv2eg00aDD5WjLS
```

### **For Production:**
You'll need to get **live keys** from your friend:
- `pk_live_...` (Publishable Key for frontend)
- `sk_live_...` (Secret Key for backend only)

### **How to Provide Keys:**

#### **Option 1: Environment Variables (Recommended)**
```javascript
// Frontend .env file
REACT_APP_API_URL=http://localhost:3000
// Don't put Stripe keys in frontend .env - get them from backend API
```

#### **Option 2: Configuration Endpoint (Current Setup)**
```javascript
// Frontend gets keys from your backend
const stripeConfig = await fetch('/api/ecom/payments/config');
// This is more secure as keys are managed centrally
```

---

## 🧪 **TESTING GUIDE**

### **Test Cards for Development:**
```javascript
// Success
4242 4242 4242 4242

// Declined
4000 0000 0000 0002

// Insufficient Funds
4000 0000 0000 9995

// Requires Authentication (3D Secure)
4000 0000 0000 3220
```

### **Testing Checklist:**
- [ ] Product listing loads correctly
- [ ] Add to cart functionality works
- [ ] Stock checking prevents overselling
- [ ] Checkout form validates customer info
- [ ] Payment processing completes successfully
- [ ] Order confirmation displays correctly
- [ ] Stock reduces after successful payment

---

## 📞 **COMMUNICATION WITH FRONTEND TEAM**

### **What to Tell Them:**

1. **"Backend is ready!"** - All APIs are implemented and tested
2. **"Use the configuration endpoint"** - Get Stripe keys from `/api/ecom/payments/config`
3. **"Follow the 3-step payment flow"** - Create Intent → Stripe Payment → Confirm with Backend
4. **"Stock management is automatic"** - Don't worry about inventory, it's handled server-side
5. **"Error handling is built-in"** - APIs return clear error messages

### **What You Need from Them:**

1. **Confirm API endpoints work** for their use cases
2. **Test the complete checkout flow** with test cards
3. **Validate error handling** (insufficient stock, payment failures)
4. **Confirm the customer experience** meets requirements

### **Support Available:**

- ✅ **Complete API documentation** (this guide)
- ✅ **Working React examples** (in `frontend-examples/`)
- ✅ **Test environment ready** (test Stripe keys configured)
- ✅ **Error handling examples** (in documentation)

---

## 🚀 **READY FOR INTEGRATION!**

Your backend provides:
- ✅ **Complete product management**
- ✅ **Secure payment processing**
- ✅ **Automatic stock management**
- ✅ **Order tracking system**
- ✅ **Comprehensive error handling**

**Frontend team can start integration immediately!** 🎉
