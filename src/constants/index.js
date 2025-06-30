import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// API Configuration  
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

// Feature flags
export const FEATURES = {
  LIVE_SHOPPING: true,
  ESCROW_PAYMENTS: true,
  PUSH_NOTIFICATIONS: true,
  ANALYTICS: true,
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// Image sizes
export const IMAGE_SIZES = {
  THUMBNAIL: 100,
  SMALL: 200,
  MEDIUM: 400,
  LARGE: 800,
  PROFILE: 150,
};

// Time constants
export const TIME = {
  SPLASH_DURATION: 2000,
  TOAST_DURATION: 3000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_BIO_LENGTH: 500,
  MAX_PRODUCT_TITLE_LENGTH: 100,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 2000,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PRODUCT_ADDED: 'Product added successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
};
