import axios from 'axios';

const API_URL = `http://${window.location.hostname}:3001/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) config.headers = {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 