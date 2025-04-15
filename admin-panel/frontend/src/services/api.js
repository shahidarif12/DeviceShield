import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized error (redirect to login)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define API methods
export const authAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  loginWithFirebase: async (firebaseToken) => {
    const response = await api.post('/auth/firebase-login', { token: firebaseToken });
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

export const devicesAPI = {
  getAll: async () => {
    const response = await api.get('/devices');
    return response.data;
  },
  
  getById: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
  },
  
  update: async (deviceId, data) => {
    const response = await api.put(`/devices/${deviceId}`, data);
    return response.data;
  },
  
  getLocationHistory: async (deviceId, timeRange = '24h', limit = 50) => {
    const response = await api.get(`/devices/${deviceId}/locations`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
};

export const commandsAPI = {
  send: async (deviceId, command) => {
    const response = await api.post(`/devices/${deviceId}/commands`, command);
    return response.data;
  },
  
  getHistory: async (deviceId, limit = 50) => {
    const response = await api.get(`/devices/${deviceId}/commands`, {
      params: { limit },
    });
    return response.data;
  },
};

export const logsAPI = {
  getSmsLogs: async (deviceId, timeRange = '24h', limit = 100) => {
    const response = await api.get(`/logs/${deviceId}/sms`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
  
  getCallLogs: async (deviceId, timeRange = '24h', limit = 100) => {
    const response = await api.get(`/logs/${deviceId}/calls`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
  
  getNotificationLogs: async (deviceId, timeRange = '24h', limit = 100) => {
    const response = await api.get(`/logs/${deviceId}/notifications`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
  
  getKeyLogs: async (deviceId, timeRange = '24h', limit = 100) => {
    const response = await api.get(`/logs/${deviceId}/keys`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
  
  getFileLogs: async (deviceId, timeRange = '24h', limit = 100) => {
    const response = await api.get(`/logs/${deviceId}/files`, {
      params: { time_range: timeRange, limit },
    });
    return response.data;
  },
};

export default api;