import axios from 'axios';

/**
 * Base axios instance configured with background project defaults
 * withCredentials: true is required for HTTP-only cookies
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error handling: 401 should trigger logout in context
    if (error.response?.status === 401) {
      // Logic for 401 will be handled in the Auth provider/store
    }
    return Promise.reject(error);
  }
);
