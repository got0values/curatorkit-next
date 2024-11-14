'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import moment from 'moment';
import { 
  Box, 
  Flex,
  Button, 
  Container, 
  Select,
  FormControl,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast
} from "@chakra-ui/react"
import {FaChevronLeft} from 'react-icons/fa';
import showAdminDrawer from '@/app/utils/showAdminDrawer';
import { deleteInHouseCheckout, deleteInHouseCheckoutItem, getInHouseCheckouts, postCheckoutItem, postCreateInHouseCheckoutItem, postReturnItem } from '@/app/actions/inhousecheckout.actions';
import { CheckoutItemType, CheckoutTypes } from '@/app/types/types';

export default function InHouseCheckout() {
  const toast = useToast();

  const [checkouts, setCheckouts] = useState<CheckoutTypes[] | []>([]);
  const [items, setItems] = useState<CheckoutItemType[] | []>([]);
  const fetchCheckouts = useCallback(async () => {
    await getInHouseCheckouts()
      .then((response) => {
        if (response.success) {
          setCheckouts(response.data.checkouts);
          setItems(response.data.items)
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
  },[])

  useEffect(()=>{
    fetchCheckouts();
  },[fetchCheckouts])

  const [showDrawer,setShowDrawer] = useState(false);
  const itemNameRef = useRef<any>();
  const createItem = async () => {
    const itemName = itemNameRef.current.value;
    if (itemName !== "") {
      await postCreateInHouseCheckoutItem(itemName)
        .then((response)=>{
          if (response.success) {
            fetchCheckouts();
            toast({
              description: "Item added",
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
            setShowDrawer(false)
          }
          else {
            console.error(response)
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

  const itemToDeleteRef = useRef<any>();
  const deleteItem = async () => {
    const itemToDelete = itemToDeleteRef.current.value;
    if (itemToDelete !== "") {
      await deleteInHouseCheckoutItem(itemToDelete)
        .then((response)=>{
          if (response.success) {
            fetchCheckouts();
            toast({
              description: "Item deleted",
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

  const bcInputRef = useRef<any>();
  const checkoutItemRef = useRef<any>();
  const checkoutFunction = async () => {
    let card = bcInputRef.current.value;
    const item = checkoutItemRef.current.value;
    if (card !== "" && item !== "") {
      await postCheckoutItem(card,item)
        .then((response)=>{
          if (response.success) {
            bcInputRef.current.value = "";
            fetchCheckouts();
            bcInputRef.current.focus();
            toast({
              description: "Item checked out",
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
    else {
      toast({
        description: "Please enter a card number and select an item",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const returnFunction = async (e: any) => {
    e.preventDefault();
    const checkoutId = e.target.dataset.checkoutid;
    await postReturnItem(checkoutId)
      .then((response)=>{
        if (response.success) {
          fetchCheckouts();
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

  const deleteCheckout = async (e: any) => {
    e.preventDefault();
    const checkoutId = e.target.dataset.checkoutid;
    await deleteInHouseCheckout(checkoutId)
      .then((response)=>{
        if (response.success) {
          fetchCheckouts();
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

  return (
    <>
      <Box 
        id="main"
      >
        <Box 
          mt={4}
          pb={3}
          w="100%"
          position="relative"
        >
          <Box id="vr"></Box>
          <Heading as="h1" size="lg">In-house Checkout</Heading>
        </Box>
        <Container 
          maxW="1080px"
          mt={4}
        >
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
          <Heading 
            as="h4"
            fontSize="1.5rem"
            textAlign="center"
            mb={2}
          >
            {new Date().toDateString()}
          </Heading>
          <Box 
            my={5}
          >
            <FormControl
              display="flex"
              alignItems="center"
            >
              <Input 
                type="text" 
                ref={bcInputRef} 
                width="auto"
                maxW="300px"
                placeholder="Card number" 
                me={2}
                onKeyDown={e=>e.key==='Enter' ? checkoutFunction() : null}
                autoFocus
              />
              <Select 
                ref={checkoutItemRef}
                variant="outline"
                me="2"
                width="auto"
              >
                <option value="">Select One</option>
                {items?.length > 0 && items?.map((item,i)=>{
                  return (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                })}
              </Select>
              <Button 
                colorScheme="black"
                variant="outline"
                onClick={()=>checkoutFunction()}>
                Submit
              </Button>
            </FormControl>
          </Box>
          <TableContainer maxHeight="75vh" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th textAlign="center">#</Th>
                  <Th textAlign="center">Barcode</Th>
                  <Th textAlign="center">Name</Th>
                  <Th textAlign="center">Item</Th>
                  <Th textAlign="center">Checked Out</Th>
                  <Th textAlign="center">Returned</Th>
                  <Th textAlign="center">Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                  {checkouts.length > 0 && checkouts.map((co, i)=>{
                      return (
                        <Tr 
                          key={co.id} 
                          id={co.id.toString()} 
                        >
                            <Td textAlign="center">
                              <Text
                                color="gray"
                              >
                                {checkouts.length - i}
                              </Text>
                            </Td>
                            <Td textAlign="center">{co.card}</Td>
                            <Td textAlign="center">{co.name}</Td>
                            <Td textAlign="center">{co.item}</Td>
                            <Td textAlign="center">{moment(co.checked_out).format('MM/DD/YYYY h:mm A')}</Td>
                            <Td textAlign="center">
                              <Flex 
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Box>
                                  {co.returned ? (
                                  <Text>
                                    {moment(co.returned).format('MM/DD/YYYY h:mm A')}
                                  </Text>
                                  ) : (
                                  <Button 
                                    colorScheme="black"
                                    variant="outline"
                                    data-checkoutid={co.id}
                                    onClick={e=>returnFunction(e)}
                                  >
                                    Return
                                  </Button>
                                  )}
                                </Box>
                              </Flex>
                            </Td>
                            <Td textAlign="center"> 
                              <Button 
                                colorScheme="red"
                                data-checkoutid={co.id}
                                onClick={e=>deleteCheckout(e)}
                              >
                                Delete
                              </Button>
                            </Td>
                        </Tr>
                      )
                  })}
              </Tbody>
            </Table>
          </TableContainer>
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
                  <DrawerHeader alignSelf="flex-start" p="0 0 1rem 0">
                    <Heading 
                      as="h4" 
                      color="black"
                      size="md"
                      _dark={{
                        color: "white"
                      }}
                    >
                      Item
                    </Heading>
                  </DrawerHeader>
                  <Flex gap={2} mb={3}>
                    <Input 
                      size="sm" 
                      borderColor="black" 
                      color="black"
                      placeholder="Item Name" 
                      type="text" 
                      ref={itemNameRef}
                      _dark={{
                        color: "white"
                      }}
                    />
                    <Button 
                      colorScheme="green"
                      size="sm"
                      type="submit" 
                      onClick={()=>{createItem()}}
                    >
                      Add
                    </Button>
                  </Flex>
                  <Flex justifyContent="center" gap={1} w="100%">
                    <Select 
                      size="sm" 
                      color="black"
                      borderColor="black" 
                      ref={itemToDeleteRef as any}
                      _dark={{
                        color: "white"
                      }}
                    >
                      <option value="">Select One</option>
                        {items?.length > 0 && items?.map((item,i)=>{
                          return (
                            <option
                              key={i}
                              value={item.id}
                            >
                              {item.name}
                            </option>
                          )
                        })}
                    </Select>
                    <Button
                      colorScheme="red"
                      size="sm"
                      type="submit"
                      onClick={()=>deleteItem()}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Container>
      </Box>
    </>
  )
}