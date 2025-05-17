// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'pending_approval' | 'active' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

// Get user data from localStorage
export const getStoredUser = (): User | null => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  
  try {
    return JSON.parse(userString) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Get token from localStorage
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// Store user and token in localStorage
export const storeUserData = (user: User, token: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

// Clear user data from localStorage
export const clearUserData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getStoredToken() && !!getStoredUser();
};

// Check if user has a specific role
export const hasRole = (requiredRole: 'user' | 'admin' | string[]): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

// Get full name of user
export const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
}; 