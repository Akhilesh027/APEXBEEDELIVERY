import axios from 'axios';

const API_ROOT = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'https://server.apexbee.in'
  : 'https://server.apexbee.in';

export const API_BASE = `${API_ROOT}/api/delivery`;

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
