// API Service Layer - Calls Express Backend
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const isProduction = import.meta.env.PROD;
const requireBackend = () => {
  if (isProduction && !API_BASE_URL) {
    throw new Error('Order API is not configured for production.');
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/order';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper to handle API responses
function handleResponse(response) {
  if (response.data.success === false) {
    throw new Error(response.data.message || response.data.error || 'API Error');
  }
  return response.data;
}

// Products API
export const productsApi = {
  list: (params = {}) => api.get('/products', { params }).then(handleResponse),
  getFeatured: (limit = 10) => api.get('/products/featured', { params: { limit } }).then(handleResponse),
  get: (id) => api.get(`/products/${id}`).then(handleResponse),
  create: (data) => api.post('/products', data).then(handleResponse),
  update: (id, data) => api.put(`/products/${id}`, data).then(handleResponse),
  delete: (id) => api.delete(`/products/${id}`).then(handleResponse),
};

// Categories API
export const categoriesApi = {
  list: () => api.get('/categories').then(handleResponse),
  get: (id) => api.get(`/categories/${id}`).then(handleResponse),
  create: (data) => api.post('/categories', data).then(handleResponse),
  update: (id, data) => api.put(`/categories/${id}`, data).then(handleResponse),
  delete: (id) => api.delete(`/categories/${id}`).then(handleResponse),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart').then(handleResponse),
  add: (productId, quantity = 1) => api.post('/cart', { product_id: productId, quantity }).then(handleResponse),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }).then(handleResponse),
  remove: (itemId) => api.delete(`/cart/${itemId}`).then(handleResponse),
  clear: () => api.delete('/cart/clear').then(handleResponse),
};

// Orders API
export const ordersApi = {
  place: async (data) => {
    if (!API_BASE_URL) {
      const { data: rpcData, error } = await supabase.rpc('place_order', {
        p_user_id: data.user_id || null,
        p_items: data.items,
        p_total_amount: data.total_amount,
        p_shipping_address: data.shipping_address,
        p_payment_method: data.payment_method,
        p_special_notes: data.special_notes || null,
        p_customer_name: data.customer_name || null,
        p_customer_email: data.customer_email || null,
        p_customer_phone: data.customer_phone || null,
        p_subtotal: data.subtotal,
        p_delivery_fee: data.delivery_fee || 0,
        p_packaging_fee: data.packaging_fee || 0
      });
      if (error) throw new Error(error.message || 'Order could not be placed.');
      return { success: true, message: 'Order placed successfully', data: { ...rpcData, order_id: rpcData?.id } };
    }
    return api.post('/orders', data).then(handleResponse);
  },
  track: async (trackingToken) => {
    if (!API_BASE_URL) {
      const { data: rpcData, error } = await supabase.rpc('track_order_by_token', {
        p_tracking_token: trackingToken
      });
      if (error) throw new Error(error.message || 'Tracking could not be loaded.');
      return { success: true, data: rpcData };
    }
    return api.get(`/orders/track/${encodeURIComponent(trackingToken)}`).then(handleResponse);
  },
  getMyOrders: (params = {}) => api.get('/orders/my', { params }).then(handleResponse),
  get: (id) => api.get(`/orders/${id}`).then(handleResponse),
  cancel: (id) => api.patch(`/orders/${id}/cancel`).then(handleResponse),
  // Admin
  listAll: (params = {}) => api.get('/orders', { params }).then(handleResponse),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data).then(handleResponse),
};

// Inventory API (Admin)
export const inventoryApi = {
  list: (params = {}) => api.get('/inventory', { params }).then(handleResponse),
  getLowStock: () => api.get('/inventory/low-stock').then(handleResponse),
  getLogs: (params = {}) => api.get('/inventory/logs', { params }).then(handleResponse),
  updateStock: (data) => api.patch('/inventory/stock', data).then(handleResponse),
  restock: (data) => api.post('/inventory/restock', data).then(handleResponse),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard/stats').then(handleResponse),
  getSalesChart: (period = 'daily') => api.get('/admin/dashboard/sales-chart', { params: { period } }).then(handleResponse),
  getTopProducts: (limit = 10) => api.get('/admin/dashboard/top-products', { params: { limit } }).then(handleResponse),
  getRecentOrders: (limit = 10) => api.get('/admin/dashboard/recent-orders', { params: { limit } }).then(handleResponse),
  listUsers: (params = {}) => api.get('/admin/users', { params }).then(handleResponse),
  getUser: (id) => api.get(`/admin/users/${id}`).then(handleResponse),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then(handleResponse),
  blockUser: (id, block = true) => api.patch(`/admin/users/${id}/block`, { block }).then(handleResponse),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(handleResponse),
  getContactMessages: (params = {}) => api.get('/admin/contact-messages', { params }).then(handleResponse),
  markContactRead: (id) => api.patch(`/admin/contact-messages/${id}/read`).then(handleResponse),
  getNewsletterSubscribers: (params = {}) => api.get('/admin/newsletter', { params }).then(handleResponse),
};

// Reviews API
export const reviewsApi = {
  list: (productId, params = {}) => api.get(`/reviews/${productId}`, { params }).then(handleResponse),
  add: (productId, data) => api.post(`/reviews/${productId}`, data).then(handleResponse),
  delete: (id) => api.delete(`/reviews/${id}`).then(handleResponse),
};

// Misc API
export const miscApi = {
  submitContact: (data) => api.post('/contact', data).then(handleResponse),
  subscribeNewsletter: (email) => api.post('/newsletter', { email }).then(handleResponse),
  createPaymentIntent: (data) => api.post('/payment-intent', data).then(handleResponse),
  // Admin
  getContactMessages: (params = {}) => api.get('/admin/contact-messages', { params }).then(handleResponse),
  markContactRead: (id) => api.patch(`/admin/contact-messages/${id}/read`).then(handleResponse),
  getNewsletterSubscribers: (params = {}) => api.get('/admin/newsletter', { params }).then(handleResponse),
};

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data).then(handleResponse),
  login: (data) => api.post('/auth/login', data).then(handleResponse),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }).then(handleResponse),
  logout: () => api.post('/auth/logout').then(handleResponse),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(handleResponse),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(handleResponse),
  getProfile: () => api.get('/auth/me').then(handleResponse),
  updateProfile: (data) => api.put('/auth/update-profile', data).then(handleResponse),
  changePassword: (data) => api.put('/auth/change-password', data).then(handleResponse),
};

export default api;