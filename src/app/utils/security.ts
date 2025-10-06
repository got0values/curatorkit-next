/**
 * Security utilities and helpers for input sanitization and validation
 */

import DOMPurify from 'dompurify'
import validator from 'validator'

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (consider using a server-side sanitizer)
    return html
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

/**
 * Escapes special characters in strings for safe SQL query building
 */
export const escapeString = (str: string): string => {
  return validator.escape(str)
}

/**
 * Validates and sanitizes email addresses
 */
export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email.trim().toLowerCase()) || ''
}

/**
 * Validates file uploads for security
 */
export const validateFileUpload = (file: File): { isValid: boolean; message?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size too large. Maximum 5MB allowed.' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'File type not allowed. Only JPEG, PNG, GIF, and PDF files are permitted.' }
  }
  
  return { isValid: true }
}

/**
 * Generates a secure random string for tokens or IDs
 */
export const generateSecureToken = (length: number = 32): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for environments without crypto API
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Checks if a URL is safe (not a potential XSS vector)
 */
export const validateSafeURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    
    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:']
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false
    }
    
    // Block potentially dangerous domains
    const dangerousDomains = ['javascript:', 'data:', 'vbscript:']
    if (dangerousDomains.some(domain => url.toLowerCase().includes(domain))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Rate limiting helper for API endpoints
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  /**
   * Checks if a request should be allowed based on rate limiting
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }
  
  /**
   * Cleans up old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    this.requests.forEach((requests, identifier) => {
      const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart)
      
      if (recentRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, recentRequests)
      }
    })
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: "'self'",
  scriptSrc: "'self' 'unsafe-inline'", // Consider removing 'unsafe-inline' in production
  styleSrc: "'self' 'unsafe-inline'",
  imgSrc: "'self' data: https:",
  connectSrc: "'self'",
  fontSrc: "'self'",
  objectSrc: "'none'",
  mediaSrc: "'self'",
  frameSrc: "'none'",
} as const

/**
 * Validates user permissions for resource access
 */
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const rolePermissions: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'manage'],
    librarian: ['read', 'write'],
    user: ['read'],
  }
  
  const permissions = rolePermissions[userRole] || []
  return permissions.includes(requiredPermission)
}

/**
 * Audit logging for security events
 */
export interface AuditLogEntry {
  timestamp: Date
  userId?: number
  action: string
  resource: string
  ip?: string
  userAgent?: string
  success: boolean
  details?: Record<string, unknown>
}

export const createAuditLog = (entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry => ({
  timestamp: new Date(),
  ...entry
})

const securityUtils = {
  sanitizeHTML,
  escapeString,
  sanitizeEmail,
  validateFileUpload,
  generateSecureToken,
  validateSafeURL,
  RateLimiter,
  CSP_DIRECTIVES,
  hasPermission,
  createAuditLog,
};

export default securityUtils;