import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setInitialAuth: (state, action) => {
      const { user, token } = action.payload;
      if (user && token) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
      }
      state.isLoading = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setInitialAuth,
} = authSlice.actions;

// Async thunks for secure storage
export const persistAuth = (user, token) => async (dispatch) => {
  try {
    // Add safety check for SecureStore availability
    if (SecureStore.setItemAsync) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      console.warn('SecureStore not available for persistence');
    }
    dispatch(loginSuccess({ user, token }));
  } catch (error) {
    console.error('Error persisting auth:', error);
    // Still dispatch success even if persistence fails
    dispatch(loginSuccess({ user, token }));
  }
};

export const clearAuth = () => async (dispatch) => {
  try {
    // Add safety check for SecureStore availability
    if (SecureStore.deleteItemAsync) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } else {
      console.warn('SecureStore not available for clearing');
    }
    dispatch(logout());
  } catch (error) {
    console.error('Error clearing auth:', error);
    dispatch(logout());
  }
};

export const loadPersistedAuth = () => async (dispatch) => {
  try {
    // Add safety check for SecureStore availability
    if (!SecureStore.getItemAsync) {
      console.warn('SecureStore not available, skipping auth persistence');
      dispatch(setInitialAuth({ user: null, token: null }));
      return;
    }

    const [token, userData] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);

    if (token && userData) {
      const user = JSON.parse(userData);
      dispatch(setInitialAuth({ user, token }));
    } else {
      dispatch(setInitialAuth({ user: null, token: null }));
    }
  } catch (error) {
    console.error('Error loading persisted auth:', error);
    dispatch(setInitialAuth({ user: null, token: null }));
  }
};

export default authSlice.reducer;
