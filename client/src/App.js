import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Assistant from './components/Assistant';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import Feedback from './components/Feedback';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      newSocket.emit('join_user', user.id);
      setSocket(newSocket);
      
      return () => newSocket.close();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading SATIM Platform...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={logout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/assistant" element={<Assistant socket={socket} />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications socket={socket} />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
