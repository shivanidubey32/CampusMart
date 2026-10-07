import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

// Setup axios to always send cookies
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Check auth state on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        
        // Fetch unread count
        const unreadRes = await axios.get('/api/notifications/unread');
        setUnreadCount(unreadRes.data.count);

      } catch (error) {
        // Not logged in or token expired
        setUser(null);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Socket Connection Effect
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5001');
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_user_room', user._id);
      });

      newSocket.on('new_notification', (notification) => {
        setUnreadCount(prev => prev + 1);
        toast(notification.title || 'New Notification', { icon: '🔔' });
      });

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  const signup = async (formData) => {
    try {
      setIsLoading(true);
      // If formData is FormData (for file uploads), axios handles it
      const res = await axios.post('/api/auth/register', formData);
      setUser(res.data);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const res = await axios.post('/api/auth/login', credentials);
      setUser(res.data);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setUnreadCount(0);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, signup, login, logout, unreadCount, setUnreadCount, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
