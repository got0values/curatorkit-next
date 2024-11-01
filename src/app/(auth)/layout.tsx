'use client'

import { ChakraProvider } from '@chakra-ui/react'
import {
  Flex,
  Box,
  Stack,
} from '@chakra-ui/react'
import Head from 'next/head';
import theme from "../(fe)/theme"
 
export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
 
  return (
    <html lang="en">
      <title>CuratorKit</title>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <ChakraProvider theme={theme}>
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
        </ChakraProvider>
      </body>
    </html>
  )
}
