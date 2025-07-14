// Updated E-commerce API Service for Frontend Integration
// File: src/services/ecom_admin/authService.js

const API_BASE_URL = import.meta.env.VITE_ECOM_API_URL || 'http://localhost:3000/api/ecom';

class EcomAuthService {
  // Authentication endpoints
  async signin(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async signup(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async verifyToken(token) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    return response.json();
  }

  async forgetPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  }

  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return response.json();
  }
}

// Product endpoints
class EcomProductService {
  async getAllProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
  }

  async getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  }

  async addProduct(productData, token) {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Handle multiple file uploads
        for (let i = 0; i < productData[key].length; i++) {
          formData.append('images', productData[key][i]);
        }
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  }

  async updateProduct(id, productData, token) {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        for (let i = 0; i < productData[key].length; i++) {
          formData.append('images', productData[key][i]);
        }
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  }

  async deleteProduct(id, token) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

// Category endpoints
class EcomCategoryService {
  async getAllCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  }

  async addCategory(categoryData, token) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(categoryData)
    });
    return response.json();
  }

  async updateCategory(id, categoryData, token) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(categoryData)
    });
    return response.json();
  }

  async deleteCategory(id, token) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

// Customer endpoints
class EcomCustomerService {
  async getAllCustomers(token) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async addCustomer(customerData, token) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(customerData)
    });
    return response.json();
  }

  async updateCustomer(id, customerData, token) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(customerData)
    });
    return response.json();
  }

  async deleteCustomer(id, token) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

// Order endpoints
class EcomOrderService {
  async getAllOrders(token) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async getOrderById(id, token) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async createOrder(orderData, token) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(orderData)
    });
    return response.json();
  }

  async updateOrderStatus(id, status, token) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
}

// Stock endpoints
class EcomStockService {
  async getAllStock(token) {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async getLowStock(token) {
    const response = await fetch(`${API_BASE_URL}/stock/low-stock`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async addStock(stockData, token) {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(stockData)
    });
    return response.json();
  }

  async updateStock(id, stockData, token) {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(stockData)
    });
    return response.json();
  }
}

// Dashboard endpoints
class EcomDashboardService {
  async getDashboardStats(token) {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async getSalesAnalytics(token) {
    const response = await fetch(`${API_BASE_URL}/dashboard/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

// Export services
export const ecomAuthService = new EcomAuthService();
export const ecomProductService = new EcomProductService();
export const ecomCategoryService = new EcomCategoryService();
export const ecomCustomerService = new EcomCustomerService();
export const ecomOrderService = new EcomOrderService();
export const ecomStockService = new EcomStockService();
export const ecomDashboardService = new EcomDashboardService();

export default {
  auth: ecomAuthService,
  products: ecomProductService,
  categories: ecomCategoryService,
  customers: ecomCustomerService,
  orders: ecomOrderService,
  stock: ecomStockService,
  dashboard: ecomDashboardService
};
