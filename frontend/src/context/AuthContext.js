// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem('token');
      
      if (token) {
        try {
          const response = await getCurrentUser();
          dispatch({
            type: 'LOGIN',
            payload: { user: response.data, token },
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          sessionStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []);

  const login = async (formData) => {
    try {
      const response = await loginUser(formData);
      
      if (response.data.token) {
        const userData = response.data.user || response.data;
        dispatch({
          type: 'LOGIN',
          payload: { user: userData, token: response.data.token },
        });
        sessionStorage.setItem('token', response.data.token);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.msg || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        return { success: false, message: err.response.data.msg || 'Server error' };
      } else {
        return { success: false, message: 'Network error' };
      }
    }
  };

  const register = async (formData) => {
    try {
      const response = await registerUser(formData);
      
      if (response.data.token) {
        const userData = response.data.user || response.data;
        dispatch({
          type: 'LOGIN',
          payload: { user: userData, token: response.data.token },
        });
        sessionStorage.setItem('token', response.data.token);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.msg || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        return { success: false, message: err.response.data.msg || 'Server error' };
      } else {
        return { success: false, message: 'Network error' };
      }
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };