import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(` API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(' API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/forgot-password')) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      // Forbidden - account deactivated or insufficient permissions
      console.warn('Access forbidden:', error.response.data);
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred:', error.response.data);
    }

    if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout');
    }

    if (!error.response) {
      // Network error
      console.error('Network error - unable to connect to server');
    }

    return Promise.reject(error);
  }
);

export default api;