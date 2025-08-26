import axios from 'axios';
import config from '../config/production';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? config.API_BASE_URL 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Productos
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categorías
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (name) => api.delete(`/categories/${encodeURIComponent(name)}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// Ventas
export const salesAPI = {
  create: (data) => api.post('/sales', data),
  getAll: (params = {}) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  getStats: () => api.get('/sales/stats/overview'),
  getRecentSales: (days = 30) => api.get('/sales/stats/recent', { params: { days } }),
};

// Reportes (New reports API)
export const reportsAPI = {
  getSummary: (period) => api.get(`/reports/summary/${period}`),
  getCustom: (params) => api.get('/reports/custom', { params }),
  getSalesDetail: (params) => api.get('/reports/sales-detail', { params }),
};

// Autenticación
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
