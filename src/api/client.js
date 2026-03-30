import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mhealth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mhealth_token');
      // Optional: redirect to login or trigger an auth state update
    }
    return Promise.reject(error);
  }
);

export default client;
