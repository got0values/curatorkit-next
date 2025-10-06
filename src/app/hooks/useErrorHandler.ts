/**
 * Custom hook for error handling and user notifications
 */

import { useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { formatErrorMessage } from '../utils/api'
import { SUCCESS_MESSAGES } from '../constants'

interface UseErrorHandlerReturn {
  handleError: (error: unknown, customMessage?: string) => void
  handleSuccess: (message?: string) => void
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      showLoading?: boolean
    }
  ) => Promise<T | null>
}

/**
 * Hook that provides consistent error handling and user notifications
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const toast = useToast()

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const message = customMessage || formatErrorMessage(error)
      
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error handled by useErrorHandler:', error)
      }
    },
    [toast]
  )

  const handleSuccess = useCallback(
    (message: string = SUCCESS_MESSAGES.SAVED) => {
      toast({
        title: 'Success',
        description: message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      })
    },
    [toast]
  )

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        loadingMessage?: string
        successMessage?: string
        errorMessage?: string
        showLoading?: boolean
      } = {}
    ): Promise<T | null> => {
      const {
        loadingMessage = 'Processing...',
        successMessage,
        errorMessage,
        showLoading = true
      } = options

      let toastId: string | undefined
      
      try {
        // Show loading toast if requested
        if (showLoading) {
          toastId = toast({
            title: loadingMessage,
            status: 'loading',
            duration: null,
            isClosable: false
          }) as string
        }

        const result = await operation()

        // Close loading toast
        if (toastId) {
          toast.close(toastId)
        }

        // Show success message if provided
        if (successMessage) {
          handleSuccess(successMessage)
        }

        return result
      } catch (error) {
        // Close loading toast
        if (toastId) {
          toast.close(toastId)
        }

        handleError(error, errorMessage)
        return null
      }
    },
    [toast, handleError, handleSuccess]
  )

  return {
    handleError,
    handleSuccess,
    handleAsyncOperation
  }
}