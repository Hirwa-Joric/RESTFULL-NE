// Use .js extension to avoid TypeScript compilation issues
import _axios from 'axios';

// Get the base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Export the default axios instance
export const axios = _axios;

// Export empty objects for runtime compatibility
export const AxiosResponse = {};
export const AxiosError = {};
export const AxiosRequestConfig = {};

// Export a pre-configured instance for convenience
export const createAxiosInstance = (baseURL) => {
  return _axios.create({
    baseURL: baseURL || API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default axios; 