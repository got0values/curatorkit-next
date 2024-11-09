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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from "@chakra-ui/react"
import moment from 'moment';
import { getRoomList } from '@/app/actions/roomsigninlists.actions';
import { getRoomSignInHistory } from '@/app/actions/roomsigninhistory.actions';
import { SignInListType, SignInType } from '@/app/types/types';

export default function SignInHistory() {
    const [roomLists, setRoomLists] = useState<SignInListType[] | []>([]);
    const fetchRoomList = useCallback(async () => {
      await getRoomList()
        .then((response) => {
          setRoomLists(response.data);
        })
        .catch((res)=>{
          console.error(res)
        })
      },[])
    
    useEffect(()=>{
        fetchRoomList();
    },[fetchRoomList])

    const selectedListRef = useRef()
    const inputDateRef = useRef()
    const inputDateRef2 = useRef()
    const [signIns, setSignIns] = useState<SignInType[] | []>([]);
    const [total,setTotal] = useState(0)
    const fetchHistory = async () => {
      const listId = (selectedListRef.current as any).value
      const inputDate1 = (inputDateRef.current as any).value
      const inputDate2 = (inputDateRef2.current as any).value
      await getRoomSignInHistory(listId, inputDate1, inputDate2)
        .then((response) => {
          if (response.success) {
            setSignIns(response.data);
            setTotal(response.data.length)
          }
          else {
            console.error(response.message)
          }
        })
        .catch((res)=>{
          console.error(res)
        })
    }

    const [openModal, setOpenModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalDate, setModalDate] = useState("");
    const [modalTime, setModalTime] = useState("");
    const modalOpen = (e: any) => {
      setModalText(e.target.innerText);
      e.target.dataset.title !== null ? setModalTitle(e.target.dataset.title) : setModalTitle("Sign In Notes");
      setModalDate(moment(e.target.dataset.datetime).format('MMM D, YYYY'));
      setModalTime(moment(e.target.dataset.datetime).format('h:mm A'));
      setOpenModal(true);
    }

    const closeModal = () => {
      setOpenModal(false);
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
          <Heading as="h1" size="lg">Room Sign In History</Heading>
        </Box>
        <Container maxW="1080px" mt={4}>
          <FormControl>
            <Flex flexWrap="wrap" gap={2} alignItems="center" justifyContent="center" mt={5} mb={4}>
              <FormLabel htmlFor="history-dropdown-menu" >Room:</FormLabel> 
              <Select 
                id="histoy-dropdown-menu"
                ref={selectedListRef as any}
                variant="outline"
                me="2"
                width="auto"
              >
                <option value="All">All</option>
                {roomLists.length > 0 && roomLists.map((list,i)=>{
                  return (
                    <option key={list.id} value={list.id}>{list.name}</option>
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
                      <Th>Room</Th>
                      <Th>Barcode</Th>
                      <Th>Name</Th>
                      <Th>Date</Th>
                      <Th>Time</Th>
                      <Th>Notes</Th>
                  </Tr>
              </Thead>
              <Tbody>
                {signIns.length > 0 && signIns.map((si, i)=>{
                  return (
                    <Tr key={i}>
                      <Td><Box as="span" color="gray">{i + 1}</Box></Td>
                      <Td>{si.listIdName}</Td>
                      <Td>{si.card}</Td>
                      <Td>{si.name}</Td>
                      <Td>{moment.utc(si.datetime).local().format('MM/DD/yy')}</Td>
                      <Td>{moment.utc(si.datetime).local().format('h:mm A')}</Td>
                      <Td>
                      {si["notes"] != null &&
                        <Box 
                          data-transid={si.transId}
                          data-title={si.name} 
                          data-datetime={si.datetime}
                          onClick={(e)=>modalOpen(e)}
                        >
                          {si["notes"]}
                        </Box>
                      }
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
          <Modal isOpen={openModal} onClose={closeModal} isCentered>
            <ModalOverlay/>
            <ModalContent>
              <ModalHeader>
                {modalTitle} {modalDate} {modalTime}
                <ModalCloseButton/>
              </ModalHeader>
              <ModalBody p={8}>
                <Box>
                  {modalText}
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    )
}