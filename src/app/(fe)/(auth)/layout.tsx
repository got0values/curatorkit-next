'use client'

import {
  Flex,
  Box,
  Stack,
  Heading,
} from '@chakra-ui/react'
 
export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
 
  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg="gray.50"
      _dark={{
        bg: "gray.800"
      }}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Box
          rounded={'lg'}
          bg="white"
          _dark={{
            bg: "gray.700"
          }}
          boxShadow={'lg'}
          p={8}
        >
          {children}
        </Box>
      </Stack>
    </Flex>
  )
}
