import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadPersistedAuth } from '../store/authSlice';
import { useAuth } from '../hooks/useRedux';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Load persisted auth state on app start
    dispatch(loadPersistedAuth());
  }, [dispatch]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
