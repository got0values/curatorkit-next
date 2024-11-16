'use client'

import {useState} from 'react';
import { 
  Box, 
  Flex,
  Container,
  Heading,
  Button
} from "@chakra-ui/react";


export default function DocsEventCalendar(){
  const [iframeSource,setIframeSource] = useState("");

  return (
    <Box id="main">
      <Box
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex w="100%" >
          <Heading as="h1" size="lg" mb={3} mt={3}>
            Docs - Event Calendar
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
            <Button variant="ghost" onClick={e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__WpxjUV1DTNavk0f07m6jgA")}>
              Add a New Room
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__HZ8V2byfRWevT1tmVRY-YQ"))}>
              Delete a Room
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__KcjRGMTcQKSM0ukHWssD6Q"))}>
              Add a New Event Type
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__K8OvSeavR_OPwS8_kf2R_A"))}>
              Edit an Event Type Color
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__eq7YZLiKRyidemLSpvuPGQ"))}>
              Delete an Event Type
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__3I6MpjFeR62QNeKVgB_OnQ"))}>
              Add Equipment
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__xgTtWYkSR82KHb6mcS4gHQ"))}>
              Delete Equipment
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__yr-XGRNRT-uunvX6VBUXIQ"))}>
              Add a New Event
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__4Es7U2NLRrik4ARfOg2lRw"))}>
              Duplicate an Event
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__ISaqx_mzT420K6_d4GAnWQ"))}>
              Delete an Event
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__XU9QVBCWRrOQl8clWOkdag"))}>
              Customize the Front-end
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__lyM51OdeTUikwExi8Wm4AQ"))}>
              Build a Form
            </Button>
            <Button variant="ghost"  onClick={(e=>setIframeSource("https://scribehow.com/shared/Curatorkit_Workflow__WtFzyyvZRxOGqmyNGN-Lkg"))}>
              Delete a Form Template
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