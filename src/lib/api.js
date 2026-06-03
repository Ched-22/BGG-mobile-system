import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bgg-mobile-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = localStorage.getItem('bgg-mobile-token');
      localStorage.removeItem('bgg-mobile-token');
      localStorage.removeItem('bgg-mobile-user');
      if (hadToken) window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;