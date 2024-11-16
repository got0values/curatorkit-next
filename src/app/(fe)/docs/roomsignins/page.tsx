'use client'

import {useState} from 'react';
import { 
  Box, 
  Flex,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";


export default function DocsRoomSignIns(){
  const [iframeSource,setIframeSource] = useState("");

  return (
    <Box id="main">
      <Box
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex w="100%" >
          <Heading as="h1" size="lg" mb={3} mt={3}>
            Docs - Room Sign-ins
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
            <Button variant="ghost"  onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__cL6De9BRQbmB5PZABeRFgg")}>
              Add a New Room
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__laUpOhSbSDi3sxHdbHW8TQ"))}>
              Delete a Room
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__LVMpPBXvQqqxbI9jDf-o7w"))}>
              Add a Room Sign-in
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__7tVR-Nh3QUK7xzAiK9yxdg"))}>
              Add Notes to a Room Sign-in
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__hJHJnZSOQWub0P6FxgkwoA"))}>
              View Room Sign-in History
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