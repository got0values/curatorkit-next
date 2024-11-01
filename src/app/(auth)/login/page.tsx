'use client'

import { useState, useTransition, useEffect } from "react";
import {
  FormControl,
  Input,
  InputRightElement,
  Stack,
  Button,
  Text,
  Link,
  InputGroup,
  Heading,
  Spinner
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { postLogin } from "../../actions/login.actions";
import checkIfLoggedIn from "@/app/helpers/checkIfLoggedIn.server";
import { useRouter } from "next/navigation";
import FormAlert from '../FormAlert';
 
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorText,setErrorText] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading,setIsLoading] = useState(true);

  useEffect(()=>{
    setIsLoading(true)
    checkIfLoggedIn()
      .then((res)=>{
        if (res === true) {
          router.push("/")
        }
      })
      .catch((res)=>{
        console.error(res)
      })
    setIsLoading(false)
  },[])
 
  async function handleSubmit(formData: FormData) {
    setErrorText("");
    startTransition(()=>{
      postLogin(formData)
        .then((res)=>{
          if (res.success) {
            router.push("/");
          }
          else {
            console.log("Error: " + res.message)
            setErrorText(res.message)
          }
        })
        .catch((response)=>{
          console.log(response)
          setErrorText(response.message)
        })
    })
  }
 
  return (
    <>
      <Stack align={'center'} spacing={5}>
        <Heading fontSize={'4xl'} textAlign={'center'}>
          Log in
        </Heading>
        {isLoading ? (
          <Spinner size="xl" />
        ): (
          <form action={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <Input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  size="lg"
                  isDisabled={isPending}
                  required 
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="Password" 
                    isDisabled={isPending}
                    size="lg"
                    required />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      p={0}
                      onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={3} pt={2}>
                <Stack spacing={3}>
                  <Button 
                    type="submit"
                    loadingText="Submitting"
                    isLoading={isPending}
                    isDisabled={isPending}
                    size="lg"
                    bg={'blue.400'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.500',
                    }}>
                    Login
                  </Button>
                </Stack>
                {errorText ? (
                  <FormAlert errorText={errorText} />
                ): null}
                <Text align={'center'}>
                  Don&apos;t have an account yet? <Link href="/register" color={'blue.400'}>Register</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        )}
      </Stack>
    </>
  )
}
