'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import moment from 'moment';
import paginate from '@/app/utils/paginate';
import PageNavigation from '@/app/utils/PageNavigation';
import {FaChevronLeft} from 'react-icons/fa';
import { 
  Box, 
  Flex,
  Button, 
  Heading,
  Input,
  Select,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Container,
  Fade,
  useToast
} from "@chakra-ui/react"
import showAdminDrawer from '@/app/utils/showAdminDrawer';
import { deleteComputer, getCompSignIns, postAddComputer, postAddTimeIn, postAddTimeOut } from '@/app/actions/compsignin.actions';
import { ComputerType } from '@/app/types/types';

export default function CompSignIn() {
  const toast = useToast();
  const [showDrawer,setShowDrawer] = useState(false)

  const [computers,setComputers] = useState<ComputerType[] | []>([]);
  const fetchComputers = useCallback(async () => {
    await getCompSignIns()
      .then((response) => {
        if (response.success) {
          setComputers(response.data)
        }
        else {
          toast({
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  },[])

  useEffect(()=>{
      fetchComputers();
  },[fetchComputers])

  const [pages, setPages] = useState<any[][]>([]);
  useEffect(()=>{
    setPages(paginate(computers, 12))
  },[computers])

  const [page,setPage] = useState(0);
    function changePage(e: any) {
      e.preventDefault();
      let selectedPage = e.target;
      const pageButtons = document.querySelectorAll(".page-button")
      for (let pageButton of pageButtons as unknown as any) {
        pageButton.classList.remove("selected")
      }
      selectedPage.classList.add("selected")
      setPage(e.target.value)
    }

  const addCompTextRef = useRef<any>();
  async function addComputer() {
    await postAddComputer(addCompTextRef.current.value)
      .then((response) => {
        if (response.success) {
          fetchComputers();
          addCompTextRef.current.value = "";
          toast({
            description: "Computer added",
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          console.error(response);
          toast({
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=> {
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const compToDeleteRef = useRef<any>()
  async function deleteComp(e: any) {
    e.preventDefault();
    const compToDelete = compToDeleteRef.current.value
    if (compToDelete !== "") {
      if(window.confirm("Are you sure you want to delete this computer?")) {
        await deleteComputer(compToDelete)
          .then((response) => {
            if (response.success) {
              fetchComputers();
            }
            else {
              console.error(response);
              toast({
                description: response.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
              })
            }
          })
          .catch((res)=>{
            console.error(res);
            toast({
              description: res.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          })
      }
    }
  }

  const [nameInput,setNameInput] = useState("");
  const [timeInput,setTimeInput] = useState(0);
  async function addTimeIn(e: any) {
    e.preventDefault();
    await postAddTimeIn(nameInput.toString(), timeInput.toString(), e.target.value)
      .then((response) => {
        if (response.success) {
          setNameInput("")
          setTimeInput(30)
          fetchComputers();
        }
        else {
          const errorRow = document.getElementById(`error-${e.target.value}`)
          if (errorRow) {
            errorRow.innerText = "No Negative Numbers";
          }
          toast({
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }  

  async function addTimeOut(e: any) {
    e.preventDefault();
    await postAddTimeOut(e.target.value)
      .then((response) => {
        if (response.success) {
          fetchComputers();
        }
        else {
          console.error(response);
          toast({
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }  

  function countDown(transid: string) {
    setInterval(()=>{
      let datetimeinEl = document.getElementById(`datetimein-${transid}`)
      let datetimein = datetimeinEl && datetimeinEl.dataset.datetimein
      let timelengthEl = document.getElementById(`timelength-${transid}`)
      let timelength = timelengthEl && parseInt(timelengthEl.dataset.timelength as string);
      let timeToSignOut = new Date(datetimein!).getTime() + timelength!*60000;
      let timeNow = new Date().getTime();
      if (timeNow >= timeToSignOut) {
        let scheduledtimeout = document.getElementById(`scheduledtimeout-${transid}`);
        if (scheduledtimeout) {
          scheduledtimeout.style.backgroundColor = "red";
          scheduledtimeout.style.padding = "2px";
          scheduledtimeout.style.borderRadius = "5px";
          scheduledtimeout.style.color = "white";
        }
      }
    },1000)
  }

  return (
    <>
      <Box id="main">
        <Box 
          mt={4}
          pb={3}
          w="100%"
          position="relative"
        >
          <Box id="vr"></Box>
          <Heading as="h1" size="lg">Computer Sign-in</Heading>
        </Box>
        <Container maxWidth="1320px" mt={4}>
          <Button 
            colorScheme="black"
            variant="outline"
            position="fixed"
            top="10vh"
            right={0}
            ps={0}
            pe={0}
            minW={0}
            w={5}
            style={{display: `${showDrawer ? "none" : "block"}`}}
            onClick={e=>showAdminDrawer(setShowDrawer)}
          >
            <FaChevronLeft/>
          </Button>
          <Heading as="h3" fontSize="1.5rem" textAlign="center">{new Date().toDateString()}</Heading>
          <Flex flexWrap="wrap" mt={5} gap={2}>
            {pages.length > 0 && pages[page].map((computer, index) => (
              <Fade in={true} key={index}>
                <Flex 
                  direction="column" 
                  border="1px solid"
                  borderColor="gray.300"
                  key={computer.id} 
                  p={3} 
                  boxShadow="sm" 
                  rounded="md"
                  // backgroundColor="white" 
                  width="19rem" 
                  minHeight="18rem"
                  h="100%"
                >
                  <Flex alignItems="center" justifyContent="space-between">
                    <Heading as="h6" size="sm" mb="0">
                      {computer.name}
                    </Heading>
                  </Flex>
                  <Flex direction="column" height="100%">
                    {computer.signindata ? (
                    <Flex 
                      flexDirection="column"
                      justifyContent="space-between"
                      flexGrow="1"
                      mt={2}
                      id={`signedin-${computer.signindata["transid"]}`} 
                      data-signedin={computer.signindata["transid"]} 
                    >
                      {countDown(computer.signindata["transid"])}
                      <Box>
                        Name: {computer.signindata["name"]}
                      </Box>
                      <Box id={`timelength-${computer.signindata["transid"]}`} data-timelength={computer.signindata["length"]}>
                        Length: {computer.signindata["length"]} min
                      </Box>
                      <Box id={`datetimein-${computer.signindata["transid"]}`} data-datetimein={computer.signindata["datetimein"]}>
                        Time in: {moment.utc(computer.signindata.datetimein).local().format('h:mm A')}
                      </Box>
                      <Box>
                        Scheduled time out: <span id={`scheduledtimeout-${computer.signindata["transid"]}`}>{moment.utc(computer.signindata.datetimein).add(computer.signindata["length"],'minutes').local().format('h:mm A')}</span>
                      </Box>
                      <Flex textAlign="center">
                        <Button 
                          colorScheme="red" 
                          flexGrow="1"
                          value={computer.signindata["transid"]} 
                          onClick={e=>addTimeOut(e)} 
                          className="mt-1"
                        >
                          Sign Out
                        </Button>
                      </Flex>
                    </Flex>
                    ) : (
                    <Flex flexDirection="column" flexGrow="1" justifyContent="space-between">
                      <Flex flexGrow="1" alignItems="flex-end">
                        <Input 
                          type="text" 
                          id="compSignInName" 
                          placeholder="Name"
                          className="form-control mt-3 col"
                          onChange={e=>setNameInput(e.target.value)}
                        />
                        <Input 
                          type="number" 
                          width="25%"
                          ms={1}
                          min="1" 
                          max="240"
                          id="compSignInTime" 
                          placeholder="30"
                          onChange={e=>setTimeInput(e.target.value)}
                        />
                        <Box as="span">min</Box>
                      </Flex>
                      <Flex justifyContent="center" ms="auto" me="autp" color="red" mt={1} id={`error-${computer.id}`}>
                      </Flex>
                      <Flex flexDirection="column" flexGrow="1" justifyContent="flex-end">
                        <Button 
                          colorScheme="green" 
                          value={computer.id}
                          onClick={e=>{addTimeIn(e)}}
                        >
                          Sign In
                        </Button>
                      </Flex>
                    </Flex>
                    )}
                  </Flex>
                </Flex>
              </Fade>
            ))}
          </Flex>
          <PageNavigation pages={pages} changePage={changePage}/>
        </Container>
        <Drawer 
          isOpen={showDrawer} 
          onClose={()=>setShowDrawer(false)} 
          // scroll="true"
          placement="end"
        >
          <DrawerOverlay/>
          <DrawerContent
            backgroundColor="transparent"
            pt={5}
            boxShadow="none"
          >
            
            <DrawerBody 
              display="flex" 
              flexDirection="column" 
              alignItems="flex-end" 
              justifyContent="flex-start" 
              gap={5}
              pe={3}
            >

              <Flex 
                backgroundColor="#f7f7f7" 
                color="white"
                rounded="md" p={5} 
                flexDirection="column" 
                alignItems="flex-end" 
                justifyContent="flex-start"
                _dark={{
                  backgroundColor: "var(--chakra-colors-gray-800)",
                  color: "black"
                }}
              >
                <DrawerCloseButton 
                  color="black"
                  mt={6} 
                  mr={3}
                  _dark={{
                    color: "white"
                  }}
                />
                <DrawerHeader alignSelf="flex-start" padding="0 0 1rem 0">
                  <Heading 
                    as="h4" 
                    color="black"
                    size="md"
                    _dark={{
                      color: "white"
                    }}
                  >
                    Computer
                  </Heading>
                </DrawerHeader>
                <Flex gap={2} mb={3}>
                  <Input 
                    size="sm" 
                    borderColor="black" 
                    color="black"
                    placeholder="Computer Name" 
                    type="text" 
                    ref={addCompTextRef as any}
                    _dark={{
                      color: "white"
                    }}
                  />
                  <Button 
                    colorScheme="green"
                    size="sm"
                    type="submit" 
                    onClick={()=>{addComputer()}}
                  >
                    Add
                  </Button>
                </Flex>
                <Flex justifyContent="center" w="100%" gap={1}>
                  <Select 
                    size="sm" 
                    color="black"
                    borderColor="black" 
                    ref={compToDeleteRef as any}
                    _dark={{
                      color: "white"
                    }}
                  >
                    <option value="">Select One</option>
                      {computers?.length > 0 && computers?.map((computer,i)=>{
                        return (
                          <option
                            key={i}
                            value={computer.id}
                          >
                            {computer.name}
                          </option>
                        )
                      })}
                  </Select>
                  <Button
                    colorScheme="red"
                    size="sm"
                    type="submit"
                    onClick={e=>deleteComp(e)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  )
}