import { useSelector, useDispatch } from 'react-redux';

// Typed hooks for TypeScript (when we migrate)
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Auth hooks
export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useIsAuthenticated = () => {
  return useSelector((state) => state.auth.isAuthenticated);
};

export const useCurrentUser = () => {
  return useSelector((state) => state.auth.user);
};
