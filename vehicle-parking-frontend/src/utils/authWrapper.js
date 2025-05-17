// JavaScript wrapper for auth.ts
// Export User as a runtime object
export const User = {};

// Get user data from localStorage
export const getStoredUser = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Get token from localStorage
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Store user and token in localStorage
export const storeUserData = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

// Clear user data from localStorage
export const clearUserData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getStoredToken() && !!getStoredUser();
};

// Check if user has a specific role
export const hasRole = (requiredRole) => {
  const user = getStoredUser();
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

// Logout user by clearing stored data
export const logoutUser = () => {
  // Clear local storage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // Reset any session storage that might exist
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  
  // Clear any cookies that might be related to auth
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

// Get full name of user
export const getFullName = (user) => {
  return `${user.firstName} ${user.lastName}`;
}; 