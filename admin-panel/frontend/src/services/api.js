import axios from 'axios';
import { getToken } from '../firebase/auth';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    // Get token from Firebase auth
    const token = await getToken();
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions
export const login = async (firebaseToken) => {
  try {
    const response = await api.post('/auth/login-firebase', { token: firebaseToken });
    return response.data;
  } catch (error) {
    console.error('Error logging in: ', error);
    throw error;
  }
};

export const getAllDevices = async () => {
  try {
    const response = await api.get('/devices');
    return response.data;
  } catch (error) {
    console.error('Error fetching devices: ', error);
    throw error;
  }
};

export const getDeviceDetails = async (deviceId) => {
  try {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching device ${deviceId}: `, error);
    throw error;
  }
};

export const getDeviceLocation = async (deviceId, timeRange = '24h') => {
  try {
    const response = await api.get(`/devices/${deviceId}/locations`, {
      params: { time_range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching location for device ${deviceId}: `, error);
    throw error;
  }
};

export const sendCommand = async (deviceId, command) => {
  try {
    const response = await api.post(`/commands/${deviceId}`, command);
    return response.data;
  } catch (error) {
    console.error(`Error sending command to device ${deviceId}: `, error);
    throw error;
  }
};

export const getCommandHistory = async (deviceId) => {
  try {
    const response = await api.get(`/commands/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching command history for device ${deviceId}: `, error);
    throw error;
  }
};

export const getSmsLogs = async (deviceId, timeRange = '24h') => {
  try {
    const response = await api.get(`/logs/sms/${deviceId}`, {
      params: { time_range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching SMS logs for device ${deviceId}: `, error);
    throw error;
  }
};

export const getCallLogs = async (deviceId, timeRange = '24h') => {
  try {
    const response = await api.get(`/logs/calls/${deviceId}`, {
      params: { time_range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching call logs for device ${deviceId}: `, error);
    throw error;
  }
};

export const getNotificationLogs = async (deviceId, timeRange = '24h') => {
  try {
    const response = await api.get(`/logs/notifications/${deviceId}`, {
      params: { time_range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching notification logs for device ${deviceId}: `, error);
    throw error;
  }
};

export default api;