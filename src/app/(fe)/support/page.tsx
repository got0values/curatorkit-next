'use client'

import {useRef,useState} from 'react';
import { 
  Box, 
  Flex,
  Heading,
  Input,
  Text,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  useToast
} from "@chakra-ui/react";
import { postSupportRequest } from '@/app/actions/support.actions';

export default function Support() {
  const toast = useToast();
  const emailRef = useRef<any>();
  const messageRef = useRef<any>();
  const [errorMsg,setErrorMsg] = useState("");

  async function sendSupport() {
    const email = emailRef.current.value;
    const message = messageRef.current.value;
    await postSupportRequest(email, message)
      .then((response)=>{
        if (response.success) {
          toast({
            description: "Support message has been successfully sent",
            status: 'success',
            duration: 9000,
            isClosable: true,
          });
          setErrorMsg("")
        }
        else {
          setErrorMsg(response.message);
          console.error(response)
          toast({
            description: response.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
  }

  return (
    <Box id="main">
      <Flex 
        alignItems="center" 
        justifyContent="center"
        h="85vh"
      >
        <Box 
          mt={10} 
          w={[ "90%", "90%", "30%"]}
          rounded="md"
          p={8}
          shadow="md"
          border=".5px solid"
          borderColor="lightgrey"

        >
          <Heading as="h1" textAlign="center" size="lg" mb={5}>
            Support
          </Heading>
          <FormControl>
            <FormLabel htmlFor="email" fontWeight="900" mt={2} mb={1}>Email</FormLabel>
            <Input 
              type="email" 
              id="email"
              ref={emailRef}
            />
            <FormLabel htmlFor="body" fontWeight="900" mt={2} mb={1}>Message</FormLabel>
            <Textarea 
              id="body"
              ref={messageRef}
            >
            </Textarea>
            <Flex flexDirection="column" alignItems="center" justifyContent="center">
              <Text color="red">{errorMsg}</Text>
              <Button mt={3} onClick={()=>sendSupport()}>Submit</Button>
            </Flex>
          </FormControl>
        </Box>
      </Flex>
    </Box>
  )
}