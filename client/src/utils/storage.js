// localStorage utility functions

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Trigger custom event for same-tab localStorage update
    window.dispatchEvent(new CustomEvent('localStorageUpdate', {
      detail: { key, newValue: JSON.stringify(value) }
    }));
    
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    
    // Trigger custom event for same-tab localStorage update
    window.dispatchEvent(new CustomEvent('localStorageUpdate', {
      detail: { key, newValue: null }
    }));
    
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent('storageCleared'));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// User-specific storage functions
export const getCurrentUser = () => getStorageItem('currentUser');
export const setCurrentUser = (user) => setStorageItem('currentUser', user);

export const getUsers = () => getStorageItem('users', []);
export const setUsers = (users) => setStorageItem('users', users);

export const getFriendships = () => getStorageItem('friendships', []);
export const setFriendships = (friendships) => setStorageItem('friendships', friendships);

export const getInvitations = (type) => getStorageItem(`${type}Invitations`, []);
export const setInvitations = (type, invitations) => setStorageItem(`${type}Invitations`, invitations);