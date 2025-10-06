/**
 * Form validation utilities and custom validators
 */

import validator from 'validator'
import passwordValidator from 'password-validator'
import { VALIDATION } from '../constants'

/**
 * Email validation
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' }
  }
  
  if (!validator.isEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' }
  }
  
  if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
    return { isValid: false, message: `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters` }
  }
  
  return { isValid: true }
}

/**
 * Password validation with comprehensive rules
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' }
  }

  const schema = new passwordValidator()
  schema
    .is().min(VALIDATION.PASSWORD.MIN_LENGTH)
    .is().max(VALIDATION.PASSWORD.MAX_LENGTH)
    .has().uppercase()
    .has().lowercase()
    .has().digits(VALIDATION.PASSWORD.REQUIRED_DIGITS)
    .has().symbols(VALIDATION.PASSWORD.REQUIRED_SYMBOLS)
    .has().not().spaces()

  interface ValidationError {
    message: string
    validation: string
  }

  const result = schema.validate(password, { details: true }) as ValidationError[]
  
  if (result.length > 0) {
    const friendlyMessages: Record<string, string> = {
      'min': `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters long`,
      'max': `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters long`,
      'uppercase': 'Password must contain at least one uppercase letter',
      'lowercase': 'Password must contain at least one lowercase letter',
      'digits': `Password must contain at least ${VALIDATION.PASSWORD.REQUIRED_DIGITS} numbers`,
      'symbols': `Password must contain at least ${VALIDATION.PASSWORD.REQUIRED_SYMBOLS} special character`,
      'spaces': 'Password cannot contain spaces'
    }
    
    const firstError = result[0]
    const message = friendlyMessages[firstError.validation] || firstError.message
    return { isValid: false, message }
  }
  
  return { isValid: true }
}

/**
 * Name validation
 */
export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' }
  }
  
  if (name.length > VALIDATION.NAME.MAX_LENGTH) {
    return { isValid: false, message: `Name must be less than ${VALIDATION.NAME.MAX_LENGTH} characters` }
  }
  
  // Basic name validation - letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Name contains invalid characters' }
  }
  
  return { isValid: true }
}

/**
 * Required field validation
 */
export const validateRequired = (value: string | number | boolean, fieldName: string): { isValid: boolean; message?: string } => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` }
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required` }
  }
  
  return { isValid: true }
}

/**
 * URL validation
 */
export const validateURL = (url: string): { isValid: boolean; message?: string } => {
  if (!url) {
    return { isValid: false, message: 'URL is required' }
  }
  
  if (!validator.isURL(url)) {
    return { isValid: false, message: 'Please enter a valid URL' }
  }
  
  return { isValid: true }
}

/**
 * Phone number validation
 */
export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' }
  }
  
  if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
    return { isValid: false, message: 'Please enter a valid phone number' }
  }
  
  return { isValid: true }
}

/**
 * Generic form validation helper
 */
export const validateForm = (
  values: Record<string, string | number | boolean>,
  rules: Record<string, (value: string | number | boolean) => { isValid: boolean; message?: string }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  let isValid = true
  
  for (const [field, value] of Object.entries(values)) {
    if (rules[field]) {
      const result = rules[field](value)
      if (!result.isValid) {
        errors[field] = result.message || 'Invalid value'
        isValid = false
      }
    }
  }
  
  return { isValid, errors }
}