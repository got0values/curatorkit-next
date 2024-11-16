'use client'

import {useState} from 'react';
import { 
  Box, 
  Flex,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";


export default function DocsInHouseCheckout(){
  const [iframeSource,setIframeSource] = useState("");

  return (
    <Box id="main">
      <Box
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex w="100%" >
          <Heading as="h1" size="lg" mb={3} mt={3}>
            Docs - In-house Checkout
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
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__OpTfS7eTTeiCLOfFLRdJXg")}>
              Add New Item
            </Button>
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__pEeTVI0OTB-LhfjpCbEjLQ")}>
              Delete Item
            </Button>
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__AcpRhRW4TUCvl0nGZaUkMA")}>
              Add a New In-house Checkout
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__k2YhxdPCRIadaxdk0XTLKg"))}>
              View In-house Checkout History
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