// Import from our JavaScript wrapper instead of axios directly
import { axios, createAxiosInstance } from '../utils/axiosWrapper';
import { toast } from 'react-toastify';

// Define the types for internal use
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
};

type AxiosError<T = any> = Error & {
  config: any;
  code?: string;
  request?: any;
  response?: AxiosResponse<T>;
  isAxiosError: boolean;
};

// Create base axios instance
const api = createAxiosInstance(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      const url = error.config?.url || '';
      
      // List of endpoints that should handle errors silently (no toast notifications)
      const silentErrorEndpoints = [
        '/bookings/admin/all',
        '/bookings/admin/pending-approval'
      ];
      
      // Check if this URL should be handled silently
      const isSilentError = silentErrorEndpoints.some(endpoint => url.includes(endpoint));
      
      switch (status) {
        case 401:
          // Unauthorized - clear stored data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // If not already on the login page, redirect
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Only show toast for non-silent errors
          if (!isSilentError) {
            toast.error('Access denied. You do not have permission to perform this action.');
          }
          break;
          
        case 404:
          // Not found
          toast.error('Resource not found.');
          break;
          
        case 500:
          // Server error - provide more specific information if available
          if (error.response.data && error.response.data.message) {
            toast.error(`Server error: ${error.response.data.message}`);
            // Log to console for debugging
            console.error('Server error details:', error.response.data);
          } else {
            toast.error('Server error occurred. Our team has been notified.');
            // Log the full error for debugging
            console.error('Server error details:', error);
          }
          break;
          
        default:
          // Handle other status codes
          if (error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error(`Error (${status}): An unexpected error occurred.`);
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      // This is typically a network error
      const url = error.config?.url || '';
      
      // List of endpoints that should handle errors silently
      const silentErrorEndpoints = [
        '/bookings/admin/all',
        '/bookings/admin/pending-approval'
      ];
      
      // Check if this URL should be handled silently
      const isSilentError = silentErrorEndpoints.some(endpoint => url.includes(endpoint));
      
      // Only show toast for non-silent errors
      if (!isSilentError) {
        toast.error('Unable to connect to the server. Please check your internet connection.');
      }
      console.error('Network error details:', error);
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Error preparing request. Please try again.');
      console.error('Request setup error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api; 