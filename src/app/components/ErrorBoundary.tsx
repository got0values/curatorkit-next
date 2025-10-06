'use client'

import React from 'react'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default fallback UI
      return (
        <Box
          minH="400px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="red.500">
              Something went wrong
            </Heading>
            <Text color="gray.600" maxW="md">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            <Button colorScheme="blue" onClick={this.resetError}>
              Try again
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Box
                mt={4}
                p={4}
                bg="red.50"
                border="1px"
                borderColor="red.200"
                borderRadius="md"
                fontSize="sm"
                textAlign="left"
                fontFamily="mono"
                maxW="lg"
                overflow="auto"
              >
                <Text fontWeight="bold" mb={2} color="red.700">
                  Development Error Details:
                </Text>
                <Text color="red.600">
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text mt={2} fontSize="xs" color="red.500">
                    {this.state.error.stack}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary