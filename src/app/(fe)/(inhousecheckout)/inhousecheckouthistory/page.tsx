'use client'

import React, {useState, useRef, useEffect, useCallback} from 'react';
import { 
  Box, 
  Flex,
  Button, 
  Container, 
  Heading,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Text,
  useToast
} from "@chakra-ui/react"
import moment from 'moment';
import { getInHouseCheckoutHistory, getInHouseCheckoutItems } from '@/app/actions/inhousecheckouthistory.actions';
import { CheckoutItemType, CheckoutTypes } from '@/app/types/types';

export default function InHouseCheckoutHistory() {
  const toast = useToast();
  const [itemList, setItemList] = useState<CheckoutItemType[] | []>([]);
  const fetchItemList = useCallback(async () => {
    await getInHouseCheckoutItems()
      .then((response) => {
        if (response.success) {
          setItemList(response.data);
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
      fetchItemList();
  },[fetchItemList])

  const [checkouts, setCheckouts] = useState<CheckoutTypes[] | []>([]);
  const [total,setTotal] = useState(0);
  const selectedItemRef = useRef<any>();
  const inputDateRef = useRef<any>();
  const inputDateRef2 = useRef<any>();
  const fetchHistory = async () => {
    const item = selectedItemRef.current.value;
    const inputDate = inputDateRef.current.value;
    const inputDate2 = inputDateRef2.current.value;
    await getInHouseCheckoutHistory(item,inputDate,inputDate2)
      .then((response) => {
        if (response.success) {
          setCheckouts(response.data);
          setTotal(response.data.length)
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
    <Box id="main">
      <Box 
        mt={4}
        pb={3}
        w="100%"
        position="relative"
      >
        <Box id="vr"></Box>
        <Heading as="h1" size="lg">In-house Checkout History</Heading>
      </Box>
      <Container maxW="1080px" mt={4}>
        <FormControl>
          <Flex flexWrap="wrap" gap={2} alignItems="center" justifyContent="center" mt={5} mb={4}>
            <FormLabel htmlFor="history-dropdown-menu" >Item:</FormLabel> 
            <Select 
              id="histoy-dropdown-menu"
              ref={selectedItemRef as any}
              variant="outline"
              me="2"
              width="auto"
            >
              <option value="All">All</option>
              {itemList.length > 0 && itemList.map((item,i)=>{
                return (
                  <option key={item.id} value={item.id}>{item.name}</option>
                )
              })}
            </Select>
            <Flex flexWrap="wrap" alignItems="center" justifyContent="center">
              <FormLabel htmlFor="inputDate" >Date Range:</FormLabel>    
              <Input width="auto" type="date" id="inputDate" ref={inputDateRef as any}/>
              - 
              <Input width="auto" type="date" id="inputDate2" ref={inputDateRef2 as any}/>
            </Flex>

            <Button colorScheme="black" variant="outline" onClick={()=>fetchHistory()} id="button-addon2">Submit</Button>
          </Flex>
        </FormControl>
        
        <TableContainer maxHeight="75vh" overflowY="auto">
          {total !== 0 ? <Text sx={{whiteSpace: "nowrap",color: "grey"}} as="span">Total: {total}</Text> : null}
          <Table>
            <Thead>
                <Tr>
                    <Th></Th>    
                    <Th>Barcode</Th>
                    <Th>Name</Th>
                    <Th>Item</Th>
                    <Th>Checked Out</Th>
                    <Th>Returned</Th>
                </Tr>
            </Thead>
            <Tbody>
              {checkouts.length > 0 && checkouts.map((co, i)=>{
                return (
                  <Tr key={i}>
                    <Td><Box as="span" color="gray">{i + 1}</Box></Td>
                    <Td>{co.card}</Td>
                    <Td>{co.name}</Td>
                    <Td>{co.item}</Td>
                    <Td>
                      {moment(co.checked_out).format('MM/DD/YYYY h:mm A')}
                      </Td>
                    <Td>
                      {co.returned ? (
                        moment(co.returned).format('MM/DD/YYYY h:mm A')
                      ) : null}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  )
}