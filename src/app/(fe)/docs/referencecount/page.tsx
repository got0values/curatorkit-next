'use client'

import {useState} from 'react';
import { 
  Box, 
  Flex,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";


export default function DocsReferenceCount(){
  const [iframeSource,setIframeSource] = useState("");

  return (
    <Box id="main">
      <Box
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex w="100%" >
          <Heading as="h1" size="lg" mb={3} mt={3}>
            Docs - Reference Count
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
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__-heFgopRSIKAQBCChCRUdg")}>
              Add a New Department
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__pI6jSK2wT4mnVMBGPaCgWw"))}>
              Delete a Department
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__WSLXxFnUQ1i79TO9X1dmTg"))}>
              Add a New Reference Question Type
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__7hd92NUrQdWP4_35ERwhnQ"))}>
              Delete a Reference Question Type
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__hQk_YgfaT-W1VxT2r4Jz-w"))}>
              Add a Reference Question
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