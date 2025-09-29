import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

// Axios defaults
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('token') || localStorage.getItem('token');

      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('/auth/me');
          const { user } = response.data;

          dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
        } catch (error) {
          console.error('Auth initialization error:', error);

          Cookies.remove('token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];

          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    const timeoutId = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // --- Auth Actions ---

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data;

      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.post('/auth/register', userData);
      const message = response.data?.message || 'Registered. Please verify your email.';

      // Registration does not authenticate the user
      dispatch({ type: 'AUTH_FAILURE', payload: null });

      toast.success(message);
      return { success: true, message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await axios.post(`/auth/verify-email/${token}`);
      const message = response.data?.message || 'Email verified successfully!';

      dispatch({ type: 'CLEAR_ERROR' });

      toast.success(message);
      return { success: true, message };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];

      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/auth/profile', userData);
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'UPDATE_USER', payload: user });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/auth/change-password', { currentPassword, newPassword });

      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'UPDATE_USER', payload: user });

      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    verifyEmail,
    logout,
    updateProfile,
    changePassword,
    getCurrentUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
