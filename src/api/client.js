import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ERROR_MESSAGES } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'auth_token';

export const setAuthToken = async (token) => {
  if (token) {
    // Add safety check for SecureStore
    if (SecureStore.setItemAsync) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Add safety check for SecureStore
    if (SecureStore.deleteItemAsync) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = async () => {
  try {
    // Add safety check for SecureStore
    if (SecureStore.getItemAsync) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Initialize token on app start
export const initializeAuthToken = async () => {
  const token = await getAuthToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      await setAuthToken(null);
      
      // You might want to redirect to login here
      // This would typically be handled by your navigation or auth context
      
      return Promise.reject(error);
    }

    // Transform error response
    const transformedError = {
      message: getErrorMessage(error),
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(transformedError);
  }
);

// Error message helper
const getErrorMessage = (error) => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;

  if (data?.message) {
    return data.message;
  }

  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

export default api;
