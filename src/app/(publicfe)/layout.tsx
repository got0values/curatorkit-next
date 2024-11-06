'use client'

import Head from 'next/head';
import {ChakraProvider, ColorModeScript} from '@chakra-ui/react';
import { theme } from '../hooks/useCustomTheme';

export default function RootFeLayout({
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
        <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}