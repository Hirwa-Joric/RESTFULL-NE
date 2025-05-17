// This file reexports axios with additional exports for use in the app
import axios from 'axios';

// Create actual JavaScript objects that can be imported at runtime
// These match the TypeScript definitions but are actual exports
export const AxiosResponse = {};
export const AxiosError = {};
export const AxiosRequestConfig = {};

// Also provide the TypeScript types for type checking
export type AxiosResponseType<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
};

export type AxiosErrorType<T = any> = Error & {
  config: any;
  code?: string;
  request?: any;
  response?: AxiosResponseType<T>;
  isAxiosError: boolean;
};

export type AxiosRequestConfigType = {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: string;
  [key: string]: any;
};

// Export axios instance
export default axios; 