'use client'

import {useState} from 'react';
import { 
  Box, 
  Flex,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";

export default function DocsComputerSignIns() {
  const [iframeSource,setIframeSource] = useState("");

  return (
    <Box id="main">
      <Box
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex w="100%" >
          <Heading as="h1" size="lg" mb={3} mt={3}>
            Docs - Computer Sign-ins
          </Heading>
        </Flex>
      </Box>
      <Container w="100%" maxW="100%">
        <Flex
          // alignItems="center"
          justifyContent="space-between"
          flexDirection={["column","column","row"]}
        >
          <Flex 
            mt={10} 
            flexDirection="column" 
            alignItems="flex-start" 
            // justifyContent="center"
            gap={0}
            pt={15}
            pb={15}
            // ps={15}
          >
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__9y1dQcALTceamvWRoAG42Q")}>
              Add a New Computer
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__hR9TC7NRQ2CxdpnhsR5gAQ"))}>
              Delete a Computer
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__vOkTM3sfQiOeHwWi2svBMA"))}>
              Add a Computer Sign-in
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__xwmz0piJS3uAREvM02emjg"))}>
              View Computer Sign-in History
            </Button>
          </Flex>
          <Flex 
            p={15}
            alignItems="center"
            justifyContent="center"
            w="80%"
          >
            <iframe src={iframeSource} width="740" height="740" allowFullScreen frameBorder="0"></iframe>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}