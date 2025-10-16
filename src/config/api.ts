// API Configuration
// This file centralizes all API URL management
// Uses environment variables only - no hardcoded URLs

// Get the current API base URL from environment variables
export const getApiBaseUrl = (): string => {
  // Use environment variable (set in Vercel for production)
  if (import.meta.env.VITE_API_BASE_URL) {
    let baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    // Ensure the URL starts with http:// or https://
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      console.warn('⚠️ VITE_API_BASE_URL missing protocol, adding https://');
      baseUrl = `https://${baseUrl}`;
    }
    
    return baseUrl;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:5000/api';
};

// Export the current API base URL
export const API_BASE_URL = getApiBaseUrl();

// Export individual API endpoints for easy access
export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_ACTIVITIES: '/dashboard/activities',
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  CUSTOMER_STATUS: (id: string) => `/customers/${id}/status`,
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  
  // Riders
  RIDERS: '/riders',
  RIDER_BY_ID: (id: string) => `/riders/${id}`,
  RIDER_DASHBOARD: (id: string) => `/riders/${id}/dashboard`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
  
  // System
  TEST: '/test',
  HEALTH: '/health'
};

// Log current configuration (for debugging)
console.log('API Configuration:', {
  apiBaseUrl: API_BASE_URL,
  isUsingEnvVar: !!import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.VITE_API_BASE_URL ? 'production' : 'development'
});
