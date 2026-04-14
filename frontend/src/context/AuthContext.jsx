import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Define the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('projectify_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('projectify_user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const logout = () => {
    // Clear state and storage
    setUser(null);
    localStorage.clear(); // Clears user and token
    
    // Redirect to home route
    navigate('/'); 
  };

  // We memoize the value to keep Vite happy
  const value = React.useMemo(() => ({
    user, login, logout, loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Define and Export the Hook separately
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}