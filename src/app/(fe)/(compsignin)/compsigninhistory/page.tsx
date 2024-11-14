'use client'

import React, {useState,useRef} from 'react';
import { 
  Box, 
  Flex,
  Button, 
  Container, 
  Heading,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Text,
  Fade,
  useToast
} from "@chakra-ui/react"
import moment from 'moment';
import { ComputSignInDataType } from '@/app/types/types';
import { getCompSignInHistory } from '@/app/actions/compsigninhistory.actions';

export default function CompSignInHistory() {
  const toast = useToast();
  const inputDateRef = useRef<any>();
  const inputDateRef2 = useRef<any>();
  const [signIns, setSignIns] = useState<ComputSignInDataType[] | []>([]);
  const [total,setTotal] = useState(0);
  const fetchHistory = async () => {
    const inputDate = inputDateRef.current.value;
    const inputDate2 = inputDateRef2.current.value;
    await getCompSignInHistory(inputDate,inputDate2)
      .then((response) => {
        if (response.success) {
          setSignIns(response.data);
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
        <Heading as="h1" size="lg">Computer Sign-in History</Heading>
      </Box>
      <Container maxW="1080px" mt={4}>
        <Flex flexWrap="wrap" alignItems="center" gap={2} mb={5} justifyContent="center">
          <FormLabel htmlFor="inputDate" >Date Range:</FormLabel>   
          <Input width="auto" type="date" id="inputDate" ref={inputDateRef}/>
          - 
          <Input width="auto" type="date" id="inputDate2" ref={inputDateRef2}/>
          <Button width="auto" onClick={()=>fetchHistory()} id="button-addon2">Submit</Button>
        </Flex>
        <Box overflow="auto" pb={5}>
          {total !== 0 ? <Text whiteSpace= "nowrap" color="gray" as="span">Total: {total}</Text> : null}
          <Fade in={true}>
          <TableContainer maxHeight="75vh" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>#</Th>    
                  <Th>Computer</Th>
                  <Th>Name</Th>
                  <Th>Time In</Th>
                  <Th>Time Out</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {signIns.length > 0 && signIns.map((si, i)=>{
                  return (
                    <Tr key={i}>
                      <Td><Box as="span" color="gray">{i + 1}</Box></Td>
                      <Td>{si.computerName}</Td>
                      <Td>{si.name}</Td>
                      <Td>{moment(si.datetimein).format('MM/DD/YYYY h:mm A')}</Td>
                      <Td>{si.datetimeout && moment(si.datetimeout).format('MM/DD/YYYY h:mm A')}</Td>
                      <Td>{si.notes}</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
          </Fade>
        </Box>
      </Container>
    </Box>
  )
}