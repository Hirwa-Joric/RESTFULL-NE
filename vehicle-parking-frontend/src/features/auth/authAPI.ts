import api from '../../services/api';
import { storeUserData, clearUserData, User } from '../../utils/authWrapper';

// Define the User interface for TypeScript type checking
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'pending_approval' | 'active' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

// Register a new user
const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login a user
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  
  // Store token and user in localStorage
  if (response.data.token && response.data.user) {
    storeUserData(response.data.user, response.data.token);
  }
  
  return response.data;
};

// Logout a user
const logout = (): void => {
  clearUserData();
};

// Get current user data
const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authAPI = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authAPI; 