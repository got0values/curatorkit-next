/**
 * API utilities and helpers for consistent server communication
 */

import { ServerResponseType } from '../types/types'
import { ERROR_MESSAGES } from '../constants'

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Handles API responses and error states consistently
 */
export const handleAPIResponse = async <T>(
  response: Response
): Promise<ServerResponseType<T>> => {
  try {
    const data = await response.json()
    
    if (!response.ok) {
      throw new APIError(
        data.message || ERROR_MESSAGES.SERVER_ERROR,
        response.status,
        data.code
      )
    }
    
    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(ERROR_MESSAGES.NETWORK_ERROR, 0)
    }
    
    throw new APIError(ERROR_MESSAGES.SERVER_ERROR)
  }
}

/**
 * Creates a standardized API response
 */
export const createAPIResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  statusCode: number = 200
): { response: ServerResponseType<T>; status: number } => {
  return {
    response: {
      success,
      message,
      data,
    },
    status: statusCode,
  }
}

/**
 * Creates a success response
 */
export const createSuccessResponse = <T>(
  message: string,
  data?: T
): { response: ServerResponseType<T>; status: number } => {
  return createAPIResponse(true, message, data, 200)
}

/**
 * Creates an error response
 */
export const createErrorResponse = (
  message: string,
  statusCode: number = 500
): { response: ServerResponseType<null>; status: number } => {
  return createAPIResponse(false, message, null, statusCode)
}

/**
 * Retry mechanism for API calls
 */
export const retryAPICall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }
      
      if (attempt === maxRetries) {
        break
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }
  
  throw lastError!
}

/**
 * Validates server response structure
 */
export const isValidServerResponse = (response: unknown): response is ServerResponseType => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'message' in response &&
    typeof (response as ServerResponseType).success === 'boolean' &&
    typeof (response as ServerResponseType).message === 'string'
  )
}

/**
 * Formats error for user display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return ERROR_MESSAGES.SERVER_ERROR
}

/**
 * HTTP status code helpers
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Common request headers
 */
export const getCommonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})

/**
 * Builds query string from object
 */
export const buildQueryString = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}