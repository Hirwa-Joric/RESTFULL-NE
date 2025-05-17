import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import authAPI from './authAPI';
import { getStoredUser, getStoredToken } from '../../utils/auth';

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

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

// Initialize state from localStorage
const user = getStoredUser();
const token = getStoredToken();

const initialState: AuthState = {
  user: user,
  token: token,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, thunkAPI) => {
    try {
      return await authAPI.register(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, thunkAPI) => {
    try {
      return await authAPI.login(credentials);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    // Call the API logout function to clear local storage
    authAPI.logout();
    return { success: true };
  } catch (error) {
    return thunkAPI.rejectWithValue('Logout failed');
  }
});

// Get current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, thunkAPI) => {
    try {
      return await authAPI.getCurrentUser();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user data';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Registration successful. Awaiting admin approval.';
        toast.success(state.message);
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(state.message);
      })
      
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message || 'Login successful';
        toast.success(state.message);
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(state.message);
      })
      
      // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        // Reset all state fields to initial values
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
        toast.info('Logged out successfully');
      })
      
      // Get current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(fetchCurrentUser.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // Clear user data on failed fetch (likely due to invalid/expired token)
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer; 