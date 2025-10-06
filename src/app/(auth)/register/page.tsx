'use client'

import {
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Text,
  Link,
  Tooltip,
  Heading
} from '@chakra-ui/react'
import { useState, useTransition } from 'react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ImInfo } from 'react-icons/im';
import { postRegister } from '../../actions/register.actions';
import { useRouter } from 'next/navigation'
import passwordValidator from "password-validator";
import FormAlert from '../FormAlert';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const [errorText,setErrorText] = useState("");
  const [isPending,startTransition] = useTransition();
  const schema = new passwordValidator();
  schema
  .is().min(8)// Minimum length 8
  .is().max(100)// Maximum length 100
  .has().uppercase()// Must have uppercase letters
  .has().lowercase()// Must have lowercase letters
  .has().digits(2)// Must have at least 2 digits
  .has().symbols(1)
  .has().not().spaces()// Should not have spaces

  const [password, setPassword] = useState("");
  const [passwordError,setPasswordError] = useState<string | null>(null)
  
  interface ValidationError {
    message: string;
    validation: string;
  }
  
  function checkPassword(pwInput: string) {
    const pwValidationErrors = schema.validate(pwInput, {details:true}) as ValidationError[];
    if (pwValidationErrors.length) {
      setPasswordError(pwValidationErrors.length ? pwValidationErrors[0].message : null)
    }
    else {
      setPasswordError(null)
    }
    setPassword(pwInput)
    return
  }

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  function confirmPasswordCheck(text: string) {
    setConfirmPassword(text)
    if (text !== password) {
      setConfirmPasswordError("Password and confirm password do not match")
    }
    else {
      setConfirmPasswordError(null)
    }
  }

  async function submitForm(formData: FormData) {
    startTransition(()=>{
      postRegister(formData)
        .then((res)=>{
          if (res.success) {
            router.push("/")
          }
          else {
            console.log("Error: " + res.message)
            setErrorText(res.message)
          }
          console.log(res)
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
          Register
        </Heading>
        <form action={submitForm}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <Input type="email" name="email" placeholder="Email*" size="lg" required />
            </FormControl>
            <FormControl id="password" isRequired>
              <Flex gap={2}>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="Password*" 
                    value={password}
                    onChange={(e) => checkPassword(e.target.value)}
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
                <Tooltip label="Passwords requirements: Minimum length of 8, maximum length of 100, minimum of 1 uppercase letter, must have lowercase letters, minimum of 2 digits, minimum of 1 symbol, should not have spaces" hasArrow>
                  <Flex align="center" justify="center">
                    <ImInfo size={25} color="gray" />
                  </Flex>
                </Tooltip>
              </Flex>
              <Text color="red">
                {passwordError}
              </Text>
            </FormControl>
            <FormControl id="confirm_password" isRequired>
              <InputGroup>
                <Input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirm_password" 
                  placeholder="Confirm password*" 
                  value={confirmPassword}
                  onChange={(e) => confirmPasswordCheck(e.target.value)}
                  size="lg"
                  required />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    p={0}
                    onClick={() => setShowConfirmPassword((showConfirmPassword) => !showConfirmPassword)}>
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text color="red">
                {confirmPasswordError}
              </Text>
            </FormControl>
            <Stack spacing={4} pt={2}>
              <Button 
                type="submit"
                loadingText="Submitting"
                isLoading={isPending}
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}>
                Register
              </Button>
              {errorText ? (
                <FormAlert errorText={errorText} />
              ): null}
              <Text align={'center'}>
                Already a user? <Link href="/login" color={'blue.400'}>Login</Link>
              </Text>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </>
  )
}
