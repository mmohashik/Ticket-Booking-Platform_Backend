# 🔑 **ENVIRONMENT CONFIGURATION**

## **Backend Environment Variables**

### **Current .env Setup:**
```env
# Database
MONGODB_URI=mongodb+srv://admin:bigidea123@bigideadb.xeleu.mongodb.net/BigideaDB?retryWrites=true&w=majority&appName=BigideaDB
ECOM_MONGODB_URI=mongodb+srv://admin:bigidea123@bigideadb.xeleu.mongodb.net/BigideaEcomDB?retryWrites=true&w=majority&appName=BigideaDB

# JWT
JWT_SECRET="123@BigideaDB"

# Stripe Configuration (Updated with your friend's keys)
STRIPE_SECRET_KEY=sk_test_51RflZsH8Y4NurIed35nhMOXlcQdl8A0TJTO9TIjltIGnKdsnDDBAVRlZ0PF1Ez3Ocr4Q5Y2Tmke0hRLUzX3Fv2eg00aDD5WjLS
STRIPE_PUBLISHABLE_KEY=pk_test_51RflZsH8Y4NurIedtVJjjow0vcGgcSjiakk7ukq6V7ylUwk3aKIUiySY3h9COv0IBi3ISnoQSw1kF0pllVuxzTUg00YRySt0o2

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## **Frontend Environment Variables**

### **React/Next.js .env.local:**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Don't put Stripe keys here - get them from backend API
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... ❌ NOT RECOMMENDED

# Instead use the configuration endpoint ✅ RECOMMENDED
# Frontend should call: /api/ecom/payments/config
```

## **Production Keys (When Ready)**

### **Get from Your Friend:**
```env
# Production Stripe Keys (replace test keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## **Security Notes:**

### **✅ Safe to Share:**
- ✅ Stripe **publishable** keys (`pk_test_...` or `pk_live_...`)
- ✅ API URLs
- ✅ Database names (if needed)

### **❌ NEVER Share:**
- ❌ Stripe **secret** keys (`sk_test_...` or `sk_live_...`)
- ❌ JWT secrets
- ❌ Database connection strings with credentials
- ❌ Any private keys or passwords

### **Best Practice:**
Frontend should get Stripe publishable key from backend API endpoint:
```
GET /api/ecom/payments/config
```
This keeps keys centrally managed and secure!
