# 🛠️ PRODUCT EDIT & DELETE API DOCUMENTATION

## 🎯 **OVERVIEW**

The backend now supports all the edit and delete functionality that the frontend has implemented. Here are the complete API endpoints for product management.

---

## 🔧 **UPDATED ENDPOINTS**

### **1. Update Product**
```
PUT /api/ecom/products/:id
Content-Type: multipart/form-data
Authorization: Bearer {admin_token}
```

**FormData Fields:**
```javascript
const formData = new FormData();
formData.append('name', 'Updated Product Name');
formData.append('description', 'Updated description');
formData.append('price', '99.99');
formData.append('quantity', '50');
formData.append('sku', 'SKU-123');
formData.append('material', 'Cotton');
formData.append('careInstructions', 'Machine wash cold');
formData.append('category', '64f8b9c123456789abcdef01'); // ObjectId
formData.append('isActive', 'true');
formData.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL']));
formData.append('colors', JSON.stringify(['Red', 'Blue', 'Green']));

// Optional: New images
formData.append('images', file1);
formData.append('images', file2);
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "_id": "64f8b9c123456789abcdef01",
    "name": "Updated Product Name",
    "productCode": "TEE001",
    "description": "Updated description",
    "category": {
      "_id": "64f8b9c123456789abcdef02",
      "name": "T-Shirts"
    },
    "price": 99.99,
    "quantity": 50,
    "sku": "SKU-123",
    "material": "Cotton",
    "careInstructions": "Machine wash cold",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Red", "Blue", "Green"],
    "images": ["http://localhost:3000/uploads/ecom/image1.jpg"],
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2024-07-13T10:00:00.000Z",
    "updatedAt": "2024-07-13T11:00:00.000Z"
  }
}
```

---

### **2. Soft Delete Product (Move to Recycle Bin)**
```
DELETE /api/ecom/products/:id
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Product moved to recycle bin successfully"
}
```

---

### **3. Get Recycled Products**
```
GET /api/ecom/products/recycled
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "products": [
    {
      "_id": "64f8b9c123456789abcdef01",
      "name": "Deleted Product",
      "productCode": "TEE001",
      "description": "This product was deleted",
      "category": {
        "_id": "64f8b9c123456789abcdef02",
        "name": "T-Shirts"
      },
      "price": 29.99,
      "isDeleted": true,
      "deletedAt": 1689249600000,
      "deletedBy": "64f8b9c123456789abcdef03"
    }
  ]
}
```

---

### **4. Restore Product from Recycle Bin**
```
PUT /api/ecom/products/:id/restore
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Product restored successfully",
  "product": {
    "_id": "64f8b9c123456789abcdef01",
    "name": "Restored Product",
    "isDeleted": false,
    "deletedAt": 0
  }
}
```

---

### **5. Permanent Delete Product**
```
DELETE /api/ecom/products/:id/permanent
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Product permanently deleted"
}
```

---

## 🌐 **UPDATED PRODUCT MODEL**

The Product model now includes all the fields the frontend is sending:

```javascript
{
  name: String,                    // Required
  productCode: String,             // Auto-generated
  description: String,             // Required
  category: ObjectId,              // Required, ref to Category
  price: Number,                   // Default: 0
  quantity: Number,                // Default: 0
  sku: String,                     // Optional
  material: String,                // Optional
  careInstructions: String,        // Optional
  sizes: [String],                 // Array: ["S", "M", "L"]
  colors: [String],                // Array: ["Red", "Blue"]
  images: [String],                // Array of image URLs
  isActive: Boolean,               // Default: true
  isDeleted: Boolean,              // Default: false
  deletedBy: ObjectId,             // Who deleted it
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Number                // Timestamp when deleted
}
```

---

## 🔄 **FRONTEND SERVICE IMPLEMENTATION**

Your frontend service methods should work perfectly now:

```javascript
// Update Product
async updateProduct(id, productData) {
  const formData = new FormData();
  
  // Add all fields to FormData
  Object.keys(productData).forEach(key => {
    if (key === 'sizes' || key === 'colors') {
      formData.append(key, JSON.stringify(productData[key]));
    } else if (key === 'images' && Array.isArray(productData[key])) {
      productData[key].forEach(file => formData.append('images', file));
    } else if (productData[key] !== undefined && productData[key] !== null) {
      formData.append(key, productData[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/ecom/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
}

// Delete Product (Move to Recycle Bin)
async deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/ecom/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

// Get Recycled Products
async getRecycledProducts() {
  const response = await fetch(`${API_BASE_URL}/api/ecom/products/recycled`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

// Restore Product
async restoreProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/ecom/products/${id}/restore`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

// Permanent Delete
async permanentDeleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/ecom/products/${id}/permanent`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}
```

---

## 🧪 **TESTING THE API**

### **Test Update Product:**
```bash
curl -X PUT http://localhost:3000/api/ecom/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Updated Product" \
  -F "price=99.99" \
  -F "sizes=[\"S\",\"M\",\"L\"]" \
  -F "colors=[\"Red\",\"Blue\"]"
```

### **Test Delete Product:**
```bash
curl -X DELETE http://localhost:3000/api/ecom/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Test Get Recycled Products:**
```bash
curl -X GET http://localhost:3000/api/ecom/products/recycled \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Test Restore Product:**
```bash
curl -X PUT http://localhost:3000/api/ecom/products/PRODUCT_ID/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ **IMPLEMENTATION STATUS**

### **✅ Backend Implementation: COMPLETE**
- ✅ Enhanced Product model with all required fields
- ✅ Updated `updateProduct` to handle all form fields
- ✅ Soft delete functionality (moves to recycle bin)
- ✅ Get recycled products endpoint
- ✅ Restore product functionality 
- ✅ Permanent delete functionality
- ✅ Proper error handling and validation
- ✅ Authentication middleware on all protected routes

### **✅ API Response Format**
- ✅ Consistent response structure
- ✅ Proper error messages
- ✅ Populated category data in responses
- ✅ Updated timestamps

---

## 🚀 **NEXT STEPS**

1. **Test Integration**: Your frontend should now work perfectly with these APIs
2. **Admin Credentials**: Use `admin@gmail.com` / `admin123` to get the auth token
3. **Check Console**: Monitor server logs for any issues
4. **Test All Features**: Edit, Delete, Restore, Permanent Delete

---

## 🔑 **AUTHENTICATION**

Remember to get your auth token first:

```javascript
// Login to get token
const loginResponse = await fetch('http://localhost:3000/api/ecom/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@gmail.com',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();
// Use this token in all subsequent requests
```

---

## 🎉 **SUCCESS!**

The backend is now fully compatible with your frontend implementation. All edit and delete functionality should work seamlessly!

**Test it out and let me know if you need any adjustments!** 🚀
