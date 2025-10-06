/**
 * Date utility functions for consistent date handling across the application
 */

import moment from 'moment-timezone'
import { DATE_FORMATS } from '../constants'

/**
 * Formats a date using the specified format or default display format
 */
export const formatDate = (
  date: string | Date,
  format: string = DATE_FORMATS.DISPLAY,
  timezone?: string
): string => {
  if (!date) return ''
  
  const momentDate = moment(date)
  
  if (timezone) {
    return momentDate.tz(timezone).format(format)
  }
  
  return momentDate.format(format)
}

/**
 * Formats a date for API consumption
 */
export const formatDateForAPI = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.API)
}

/**
 * Formats a date for datetime display
 */
export const formatDateTime = (
  date: string | Date,
  timezone?: string
): string => {
  return formatDate(date, DATE_FORMATS.DATETIME, timezone)
}

/**
 * Gets the start of day for a given date
 */
export const getStartOfDay = (date: string | Date, timezone?: string): Date => {
  if (timezone) {
    return moment.tz(date, timezone).startOf('day').toDate()
  }
  return moment(date).startOf('day').toDate()
}

/**
 * Gets the end of day for a given date
 */
export const getEndOfDay = (date: string | Date, timezone?: string): Date => {
  if (timezone) {
    return moment.tz(date, timezone).endOf('day').toDate()
  }
  return moment(date).endOf('day').toDate()
}

/**
 * Checks if a date is in the past
 */
export const isPastDate = (date: string | Date): boolean => {
  return moment(date).isBefore(moment())
}

/**
 * Checks if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  return moment(date).isSame(moment(), 'day')
}

/**
 * Gets a human-readable relative time (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date): string => {
  return moment(date).fromNow()
}

/**
 * Calculates the difference between two dates in specified unit
 */
export const getDateDifference = (
  startDate: string | Date,
  endDate: string | Date,
  unit: moment.unitOfTime.Diff = 'days'
): number => {
  return moment(endDate).diff(moment(startDate), unit)
}

/**
 * Validates if a string is a valid date
 */
export const isValidDate = (dateString: string): boolean => {
  return moment(dateString).isValid()
}

/**
 * Converts UTC date to local timezone
 */
export const utcToLocal = (date: string | Date, timezone?: string): Date => {
  if (timezone) {
    return moment.utc(date).tz(timezone).toDate()
  }
  return moment.utc(date).local().toDate()
}

/**
 * Converts local date to UTC
 */
export const localToUTC = (date: string | Date): Date => {
  return moment(date).utc().toDate()
}