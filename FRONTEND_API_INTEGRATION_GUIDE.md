# E-commerce Backend API Documentation

## Overview
This document provides complete API documentation for the integrated e-commerce backend. Use this to ensure your frontend is correctly connected to all endpoints.

## Base URL
```
Production: http://localhost:3000/api/ecom
Development: http://localhost:3000/api/ecom
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer <your_jwt_token>',
  'Content-Type': 'application/json'
}
```

---

## 🔐 Authentication Endpoints

### 1. Sign Up (Create Admin User)
```http
POST /api/ecom/auth/signup
```

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com", 
  "password": "password123",
  "dateOfBirth": "1990-01-01"
}
```

**Response (Success):**
```json
{
  "status": "SUCCESS",
  "message": "Signup successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Admin Name",
      "email": "admin@example.com",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "createdAt": "2025-07-13T09:00:00.000Z",
      "updatedAt": "2025-07-13T09:00:00.000Z"
    }
  }
}
```

### 2. Sign In (Login)
```http
POST /api/ecom/auth/signin
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "status": "SUCCESS", 
  "message": "Sign in successful",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Verify Token
```http
GET /api/ecom/auth/verify-token
```
**Headers:** `Authorization: Bearer <token>`

### 4. Forgot Password
```http
POST /api/ecom/auth/forget-password
```
**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

### 5. Reset Password
```http
POST /api/ecom/auth/reset-password/:token
```
**Request Body:**
```json
{
  "password": "newpassword123"
}
```

---

## 📦 Product Endpoints

### 1. Get All Products (Public)
```http
GET /api/ecom/products
```

**Response:**
```json
{
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
      "images": [
        "http://localhost:3000/uploads/ecom/image1.jpg"
      ],
      "createdAt": "2025-07-13T09:00:00.000Z",
      "deletedAt": 0
    }
  ]
}
```

### 2. Get Product by ID (Public)
```http
GET /api/ecom/products/:id
```

### 3. Add New Product (Protected) ⚠️ **IMPORTANT FOR YOUR ISSUE**
```http
POST /api/ecom/products
```

**Headers:**
```javascript
{
  'Authorization': 'Bearer <your_jwt_token>'
  // Note: Content-Type is automatically set for FormData
}
```

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('description', 'Product Description');
formData.append('category', 'category_id'); // Must be valid ObjectId
formData.append('images', file1); // File object
formData.append('images', file2); // Multiple files supported
```

**Frontend Example:**
```javascript
const addProduct = async (productData, token) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('category', productData.category); // Category ObjectId
  
  // Add image files
  if (productData.images && productData.images.length > 0) {
    for (let i = 0; i < productData.images.length; i++) {
      formData.append('images', productData.images[i]);
    }
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    body: formData
  });
  
  return response.json();
};
```

**Response (Success):**
```json
{
  "status": "SUCCESS",
  "message": "Product added successfully",
  "data": {
    "_id": "new_product_id",
    "name": "Product Name",
    "productCode": "CAT001",
    "description": "Product Description", 
    "category": "category_id",
    "images": [
      "http://localhost:3000/uploads/ecom/image-timestamp.jpg"
    ],
    "createdAt": "2025-07-13T09:00:00.000Z",
    "deletedAt": 0
  }
}
```

### 4. Update Product (Protected)
```http
PUT /api/ecom/products/:id
```
**Same format as Add Product**

### 5. Delete Product (Protected)
```http
DELETE /api/ecom/products/:id
```

---

## 🏷️ Category Endpoints

### 1. Get All Categories (Public)
```http
GET /api/ecom/categories
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "_id": "category_id",
      "name": "Electronics",
      "description": "Electronic items",
      "createdAt": "2025-07-13T09:00:00.000Z",
      "deletedAt": 0
    }
  ]
}
```

### 2. Add Category (Protected)
```http
POST /api/ecom/categories
```

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category Description"
}
```

### 3. Update Category (Protected)
```http
PUT /api/ecom/categories/:id
```

### 4. Delete Category (Protected)
```http
DELETE /api/ecom/categories/:id
```

---

## 👥 Customer Endpoints (All Protected)

### 1. Get All Customers
```http
GET /api/ecom/customers
```

### 2. Add Customer
```http
POST /api/ecom/customers
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "Sydney",
  "state": "New South Wales"
}
```

**Valid States:** `['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']`

---

## 📋 Order Endpoints (All Protected)

### 1. Get All Orders
```http
GET /api/ecom/orders
```

### 2. Create Order
```http
POST /api/ecom/orders
```

**Request Body:**
```json
{
  "customer": "customer_id",
  "items": [
    {
      "stock": "stock_id",
      "quantity": 2
    }
  ],
  "totalAmount": 199.99
}
```

### 3. Update Order Status
```http
PUT /api/ecom/orders/:id/status
```

**Request Body:**
```json
{
  "status": "Shipped"
}
```

**Valid Statuses:** `['Pending', 'Shipped', 'Delivered', 'Cancelled']`

---

## 📦 Stock/Inventory Endpoints (All Protected)

### 1. Get All Stock
```http
GET /api/ecom/stock
```

### 2. Add Stock
```http
POST /api/ecom/stock
```

**Request Body:**
```json
{
  "product": "product_id",
  "batchNumber": "BATCH001",
  "quantity": 100,
  "size": "M",
  "price": 29.99,
  "supplier": "Supplier Name"
}
```

**Valid Sizes:** `['XS', 'S', 'M', 'L', 'XL', 'XXL']`

### 3. Get Low Stock Items
```http
GET /api/ecom/stock/low-stock
```

---

## 📊 Dashboard Endpoints (All Protected)

### 1. Get Dashboard Statistics
```http
GET /api/ecom/dashboard/stats
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "overview": {
      "totalProducts": 150,
      "totalCategories": 12,
      "totalCustomers": 85,
      "totalOrders": 234,
      "totalRevenue": 15750.50,
      "lowStockCount": 5
    },
    "recentOrders": [...],
    "orderStatusStats": [...],
    "monthlySales": [...]
  }
}
```

### 2. Get Sales Analytics
```http
GET /api/ecom/dashboard/analytics
```

---

## 🔍 **Troubleshooting Your Product Issue**

### ✅ **BACKEND STATUS: WORKING CORRECTLY**

**Good news!** The backend is actually working correctly:
- `GET /api/ecom/products` returns `{"status":"SUCCESS","data":[]}`  ✅ (Empty array, not object)
- `GET /api/ecom/categories` returns `{"status":"SUCCESS","data":[]}` ✅ (Empty array)

### Problem: "Product added successfully but disappears after refresh"

**Root Cause: No categories exist in database!**

**SOLUTION STEPS:**

### **STEP 1: Create Categories First!** 🏷️
```javascript
// ✅ MUST DO FIRST - Create at least one category
const createCategory = async (token) => {
  const response = await fetch('http://localhost:3000/api/ecom/categories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Electronics',
      description: 'Electronic items and gadgets'
    })
  });
  
  const result = await response.json();
  console.log('Category created:', result);
  return result.data; // Save this for product creation
};
```

### **STEP 2: Use Category ID for Products** 📦
```javascript
// ✅ After creating category, use its ID
const addProduct = async (categoryId, token) => {
  const formData = new FormData();
  formData.append('name', 'Sample Product');
  formData.append('description', 'Product description');
  formData.append('category', categoryId); // Use the ID from Step 1
  
  const response = await fetch('http://localhost:3000/api/ecom/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### **STEP 3: Complete Flow Example** 🔄
```javascript
const completeFlow = async () => {
  // 1. Login first
  const loginResponse = await fetch('http://localhost:3000/api/ecom/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    })
  });
  
  const { data: { token } } = await loginResponse.json();
  
  // 2. Create category
  const category = await createCategory(token);
  
  // 3. Create product using category ID
  const product = await addProduct(category._id, token);
  
  // 4. Verify product exists
  const productsResponse = await fetch('http://localhost:3000/api/ecom/products');
  const { data: products } = await productsResponse.json();
  
  console.log('Products in database:', products);
};
```

**Other Possible Issues:**

4. **Invalid Category ObjectId**
   ```javascript
   // ❌ Wrong - category name instead of ID
   formData.append('category', 'Electronics');
   
   // ✅ Correct - category ObjectId from API response
   formData.append('category', '67845a1b2c3d4e5f6789abcd');
   ```

5. **Missing Required Fields**
   ```javascript
   // Ensure all required fields are present
   formData.append('name', productData.name);        // Required
   formData.append('description', productData.description); // Required  
   formData.append('category', productData.categoryId);     // Required
   ```

6. **Authentication Issues**
   ```javascript
   // Make sure token is valid and not expired
   const token = localStorage.getItem('ecom_token'); // or your storage method
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

7. **Frontend State Management**
   ```javascript
   // After successful add, refresh the product list
   const result = await addProduct(productData, token);
   if (result.status === 'SUCCESS') {
     // Refresh products list
     fetchProducts();
   }
   ```

### **Debug Steps:**

1. **✅ BACKEND CONFIRMED WORKING:**
   ```bash
   # Test 1: Products endpoint returns array (not object)
   GET http://localhost:3000/api/ecom/products
   # Response: {"status":"SUCCESS","data":[]}  ✅ Correct format
   
   # Test 2: Categories endpoint returns array
   GET http://localhost:3000/api/ecom/categories  
   # Response: {"status":"SUCCESS","data":[]}  ✅ Correct format
   ```

2. **Create Admin User First:**
   ```javascript
   // If no admin exists, create one:
   const signupResponse = await fetch('http://localhost:3000/api/ecom/auth/signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Admin User',
       email: 'admin@example.com',
       password: 'password123',
       dateOfBirth: '1990-01-01'
     })
   });
   ```

3. **Verify Category Setup:**
   ```javascript
   // First create categories
   const categoryResponse = await fetch(`http://localhost:3000/api/ecom/categories`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       name: 'Electronics',
       description: 'Electronic items'
     })
   });
   
   // Use the returned category ID for products
   const category = categoryResponse.data;
   formData.append('category', category._id);
   ```

4. **Check Database State:**
   ```javascript
   // After each step, verify what's in database:
   
   // Check categories
   const categories = await fetch('http://localhost:3000/api/ecom/categories');
   console.log('Categories:', await categories.json());
   
   // Check products  
   const products = await fetch('http://localhost:3000/api/ecom/products');
   console.log('Products:', await products.json());
   ```

5. **Complete Working Example:**
   ```javascript
   // This should work end-to-end:
   const testCompleteFlow = async () => {
     try {
       // 1. Create admin (if needed)
       const signupRes = await fetch('http://localhost:3000/api/ecom/auth/signup', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: 'Test Admin',
           email: 'test@admin.com', 
           password: 'password123',
           dateOfBirth: '1990-01-01'
         })
       });
       
       // 2. Login
       const loginRes = await fetch('http://localhost:3000/api/ecom/auth/signin', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: 'test@admin.com',
           password: 'password123'
         })
       });
       
       const { data: { token } } = await loginRes.json();
       
       // 3. Create category
       const categoryRes = await fetch('http://localhost:3000/api/ecom/categories', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           name: 'Test Category',
           description: 'Test category description'
         })
       });
       
       const { data: category } = await categoryRes.json();
       console.log('Category created:', category);
       
       // 4. Create product
       const formData = new FormData();
       formData.append('name', 'Test Product');
       formData.append('description', 'Test product description');
       formData.append('category', category._id);
       
       const productRes = await fetch('http://localhost:3000/api/ecom/products', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`
         },
         body: formData
       });
       
       const productResult = await productRes.json();
       console.log('Product created:', productResult);
       
       // 5. Verify products exist
       const allProducts = await fetch('http://localhost:3000/api/ecom/products');
       const { data: products } = await allProducts.json();
       console.log('All products:', products);
       
       return products.length > 0 ? 'SUCCESS' : 'FAILED';
       
     } catch (error) {
       console.error('Test failed:', error);
       return 'ERROR';
     }
   };
   
   // Run the test
   testCompleteFlow().then(result => console.log('Test result:', result));
   ```

---

## 🖼️ Image Handling

### Image Upload
- **Location:** `/public/uploads/ecom/`
- **Access URL:** `http://localhost:3000/uploads/ecom/filename.jpg`
- **Max Size:** 5MB per file
- **Supported Formats:** Images only (jpg, png, gif, etc.)

### Frontend Image Display:
```javascript
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:3000/uploads/ecom/${imagePath}`;
};

// Usage
<img src={getImageUrl(product.images[0])} alt={product.name} />
```

---

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "status": "FAILED",
  "message": "Name, description, and category are required"
}
```

### 401 Unauthorized
```json
{
  "status": "FAILED", 
  "message": "Access denied. No token provided."
}
```

### 404 Not Found
```json
{
  "status": "FAILED",
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "FAILED",
  "message": "Internal server error"
}
```

---

## 🔧 Environment Setup

### Required Environment Variables (.env):
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication  
JWT_SECRET=your_jwt_secret_key

# CORS
CLIENT_URL=http://localhost:5173

# Email (for password reset)
EMAIL_USER=your_gmail_account
EMAIL_PASS=your_app_password
```

### Frontend Environment (.env):
```env
VITE_API_URL=http://localhost:3000
VITE_ECOM_API_URL=http://localhost:3000/api/ecom
```

---

## 🧪 Testing Endpoints

### Health Check:
```bash
curl http://localhost:3000/api/ecom/health
# Should return: {"status":"UP","service":"E-commerce Backend",...}
```

### Test Signup:
```bash
curl -X POST http://localhost:3000/api/ecom/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Admin","email":"test@admin.com","password":"password123","dateOfBirth":"1990-01-01"}'
```

### Test Login:
```bash
curl -X POST http://localhost:3000/api/ecom/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@admin.com","password":"password123"}'
```

---

## 📝 Frontend Integration Checklist

- [ ] Update environment variables to point to integrated backend
- [ ] Replace old API endpoints with `/api/ecom/*` prefix  
- [ ] Update authentication token storage (separate from main app)
- [ ] Fix image URL paths to use `/uploads/ecom/`
- [ ] Ensure proper FormData usage for file uploads
- [ ] Add error handling for all API responses
- [ ] Test all CRUD operations
- [ ] Verify product list refreshes after add/edit/delete
- [ ] Check category creation before product creation
- [ ] Validate all required fields are sent in requests

---

## 🆘 Need Help?

If you're still experiencing issues:

1. **Check server logs** - Look at the terminal running the backend
2. **Verify database connection** - Ensure MongoDB is connected
3. **Test with Postman/curl** - Verify endpoints work outside frontend
4. **Check network requests** - Use browser dev tools to inspect API calls
5. **Validate data format** - Ensure request bodies match expected format

**Common Fix for Product Disappearing:**
The most likely cause is that you're not creating categories first, or using invalid category IDs. Create categories before adding products, and use the returned ObjectId.

---

*Last Updated: July 13, 2025*
*Backend Version: 1.0.0*
*API Base URL: http://localhost:3000/api/ecom*
