/**
 * Application-wide constants and configuration values
 */

// API Constants
export const API_ENDPOINTS = {
  EVENTS: '/api/events',
  USERS: '/api/users',
  LIBRARIES: '/api/libraries',
} as const

// Date & Time Constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm',
} as const

// UI Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const CHART_COLORS = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
] as const

// Form Validation Constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    REQUIRED_DIGITS: 2,
    REQUIRED_SYMBOLS: 1,
  },
  EMAIL: {
    MAX_LENGTH: 320,
  },
  NAME: {
    MAX_LENGTH: 255,
  },
} as const

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Changes saved successfully',
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EVENTS: '/eventcalendar',
  ROOMS: '/studyrooms',
  REFERENCE: '/refcount',
  CHECKOUT: '/inhousecheckout',
  COMPUTER_SIGNIN: '/compsignin',
} as const

const constants = {
  API_ENDPOINTS,
  DATE_FORMATS,
  PAGINATION,
  CHART_COLORS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
};

export default constants;