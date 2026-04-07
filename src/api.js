import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const devApi = {
  getUsers: () => api.get('/api/dev/users'),
  register: (name, email) => api.post('/api/dev/register', { name, email }),
  login: (email) => api.post('/api/dev/login', { email }),
  getNetworks: (userId) => api.get(`/api/dev/networks/${userId}`),
  createNetwork: (userId, name, description) => api.post('/api/dev/networks', { userId, name, description }),
  invite: (networkId, inviterId, invitedEmail, proposedRole, permissions = {}) => 
    api.post('/api/dev/invite', { 
      networkId, 
      inviterId, 
      invitedEmail, 
      proposedRole,
      ...permissions
    }),
  getInvites: (email) => api.get(`/api/dev/invites/${email}`),
  acceptInvite: (token, userId) => api.post('/api/dev/accept-invite', { token, userId }),
};

export const realApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  createNetwork: (data) => api.post('/api/networks', data),
  invite: (networkId, data) => api.post(`/api/networks/${networkId}/invitations`, data),
  
  // Medications
  getMedications: (networkId) => api.get(`/api/networks/${networkId}/medications`),
  createMedication: (networkId, data) => api.post(`/api/networks/${networkId}/medications`, data),
  deleteMedication: (id) => api.delete(`/api/medications/${id}`),
  toggleBuy: (id, needsBuy) => api.patch(`/api/medications/${id}/toggle-buy`, { needsBuy }),
  getAlerts: (networkId) => api.get(`/api/networks/${networkId}/medications/alerts`),
  createIntake: (medicationId, data) => api.post(`/api/medications/${medicationId}/intakes`, data),
  addSchedule: (medicationId, data) => api.post(`/api/medications/${medicationId}/schedules`, data),
};

export default api;
