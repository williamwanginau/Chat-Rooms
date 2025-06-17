import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCurrentUser, setCurrentUser, getUsers } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const user = getCurrentUser();
    const allUsers = getUsers();
    
    setCurrentUserState(user);
    setUsers(allUsers);
    setLoading(false);

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        const newUser = getCurrentUser();
        setCurrentUserState(newUser);
      } else if (e.key === 'users') {
        const newUsers = getUsers();
        setUsers(newUsers);
      }
    };

    // Listen for custom events for same-tab localStorage changes
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === 'currentUser') {
        const newUser = getCurrentUser();
        setCurrentUserState(newUser);
      } else if (e.detail.key === 'users') {
        const newUsers = getUsers();
        setUsers(newUsers);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    };
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      login(user);
      // Refresh page to apply user switch
      window.location.reload();
    }
  };

  const value = {
    currentUser,
    users,
    loading,
    login,
    logout,
    switchUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};