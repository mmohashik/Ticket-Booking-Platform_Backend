# 🚀 **QUICK START - FRONTEND TEAM**

## **📋 IMMEDIATE ACTION ITEMS**

### **1. Install Dependencies**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **2. Base API URL**
```javascript
const API_BASE = 'http://localhost:3000/api/ecom';
```

### **3. Get Stripe Configuration**
```javascript
const getStripeConfig = async () => {
  const response = await fetch('http://localhost:3000/api/ecom/payments/config');
  const result = await response.json();
  return result.data.publishableKey;
};
```

---

## **🛍️ KEY API ENDPOINTS**

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/products` | GET | Get all products |
| `/products/:id` | GET | Get single product |
| `/products/:id/check-stock` | POST | Check availability |
| `/payments/config` | GET | Get Stripe config |
| `/payments/create-payment-intent` | POST | Start checkout |
| `/payments/confirm-payment` | POST | Complete order |
| `/payments/order/:id` | GET | Get order details |

---

## **💳 PAYMENT FLOW (3 STEPS)**

### **Step 1: Create Payment Intent**
```javascript
POST /api/ecom/payments/create-payment-intent
Body: {
  cartItems: [{ productId, quantity, size, color }],
  customerInfo: { name, email, phone, address },
  shipping: 10.00,
  tax: 5.50
}
```

### **Step 2: Process with Stripe**
```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: elements.getElement(CardElement) }
});
```

### **Step 3: Confirm with Backend**
```javascript
POST /api/ecom/payments/confirm-payment
Body: { paymentIntentId: paymentIntent.id }
```

---

## **🧪 TEST CARDS**

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient**: `4000 0000 0000 9995`

---

## **📞 QUESTIONS?**

1. **API not working?** Check if backend server is running on port 3000
2. **Stripe errors?** Verify you're using the config endpoint for keys
3. **Stock issues?** Use the check-stock endpoint before adding to cart
4. **Payment fails?** Ensure 3-step flow is followed correctly

---

## **✅ TESTING CHECKLIST**

- [ ] Products load from `/api/ecom/products`
- [ ] Stock checking works with `/api/ecom/products/:id/check-stock`
- [ ] Stripe config loads from `/api/ecom/payments/config`
- [ ] Payment intent creates successfully
- [ ] Test card processes payment
- [ ] Order confirmation returns order number
- [ ] Stock reduces after successful payment

**🎉 Ready to build an amazing e-commerce experience!**
