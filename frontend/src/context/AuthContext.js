// src/context/AuthContext.js - UPDATE ITO
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios base URL and interceptors
  useEffect(() => {
    axios.defaults.baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

    // Add token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Check if user is logged in on app start
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Login function - UPDATED FOR EMAIL VERIFICATION
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      // Check if email verification is required
      if (response.data.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: response.data.email,
          message: response.data.message
        };
      }
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        }
      }
      
      return {
        success: true,
        requiresVerification: false,
        ...response.data
      };
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  // Register function - UPDATED FOR EMAIL VERIFICATION
  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      // Check if email verification is required
      if (response.data.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: response.data.user.email,
          message: response.data.message
        };
      }
      
      // For admin users or if verification is not required
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
      }
      
      return {
        success: true,
        requiresVerification: false,
        ...response.data
      };
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  // VERIFY EMAIL FUNCTION - IDINAGDAG
  const verifyEmail = async (email, otp) => {
    try {
      const response = await axios.post('/email-verification/verify-otp', {
        email,
        otp
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed' };
    }
  };

  // RESEND OTP FUNCTION - IDINAGDAG
  const resendOTP = async (email) => {
    try {
      const response = await axios.post('/email-verification/resend-otp', {
        email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend OTP' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // UPDATE PROFILE FUNCTION
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/users/profile', profileData);
      
      if (response.data.user) {
        // Update user in localStorage and state
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    loading,
    // IDINAGDAG: Email verification functions
    verifyEmail,
    resendOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};