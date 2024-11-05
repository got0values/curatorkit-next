'use client'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import {
  Box,
  Drawer,
  DrawerContent,
  useDisclosure
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation';
import {SidebarContent, MobileNav, MainStack} from './mainLayoutComponents'
import theme from './theme'
import Head from 'next/head';
import { AllContextProvider } from '../context/AllContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname();
  const showSidebar = pathname !== "/login" && pathname !== "/register" && pathname !== "/cal";

  return (
    <html lang="en">
      <title>CuratorKit</title>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
        <ChakraProvider theme={theme}>
          <AllContextProvider>
            <Box minH="100vh">
              {showSidebar && (
                <>
                  <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'flex' }} flexDirection="column" />
                  <Drawer
                    isOpen={isOpen}
                    placement="left"
                    onClose={onClose}
                    returnFocusOnClose={false}
                    onOverlayClick={onClose}
                    size="full">
                    <DrawerContent>
                      <SidebarContent onClose={onClose} />
                    </DrawerContent>
                  </Drawer>
                  <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
                </>
              )}
              <MainStack 
                showSidebar={showSidebar}
                >
                {children}
              </MainStack>
            </Box>
          </AllContextProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
