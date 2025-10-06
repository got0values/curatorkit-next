import React from 'react'
import { Box, Spinner, Text, VStack, StackProps, Skeleton } from '@chakra-ui/react'

interface LoadingSpinnerProps extends StackProps {
  /** Loading message to display */
  message?: string
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Color of the spinner */
  color?: string
  /** Whether to show the loading message */
  showMessage?: boolean
}

/**
 * Reusable loading spinner component with customizable message and appearance
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'lg',
  color = 'blue.500',
  showMessage = true,
  ...stackProps
}) => {
  return (
    <VStack spacing={4} py={8} {...stackProps}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={color}
        size={size}
      />
      {showMessage && (
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      )}
    </VStack>
  )
}

/**
 * Full-page loading overlay component
 */
export const LoadingOverlay: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.300"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Box bg="white" p={8} borderRadius="md" boxShadow="lg">
        <LoadingSpinner {...props} />
      </Box>
    </Box>
  )
}

/**
 * Skeleton loading component for content placeholders
 */
export const LoadingSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <VStack spacing={3} align="stretch">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="20px"
          borderRadius="md"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </VStack>
  )
}

export default LoadingSpinner