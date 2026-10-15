import axios from 'axios';

// Normalize API Base URL (handle trailing slashes and missing /api path)
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';

  const clean = envUrl.trim().replace(/\/+$/, '');
  // If user passed root URL like https://myapp.onrender.com without /api, append /api
  if (!clean.endsWith('/api')) {
    return `${clean}/api`;
  }
  return clean;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 60000, // 60s timeout to gracefully handle Render free-tier cold starts
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wh_token');
      localStorage.removeItem('wh_user');
      // Only redirect if we're on an admin page
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
