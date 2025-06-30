import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export const setItem = async (key, value) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Storage setItem error:', error);
    throw error;
  }
};

export const getItem = async (key) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      return localStorage.getItem(key);
    } else {
      // Use SecureStore for mobile
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Storage getItem error:', error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for mobile
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error('Storage removeItem error:', error);
    throw error;
  }
};
