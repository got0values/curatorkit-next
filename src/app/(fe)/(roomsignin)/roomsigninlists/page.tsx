'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react'; 
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Button, 
  Container, 
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Flex,
  Select,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Link
} from "@chakra-ui/react"
import {FaChevronLeft} from 'react-icons/fa';
import showAdminDrawer from '@/app/utils/showAdminDrawer';
import { getRoomList, postAddRoomList, deleteRoom } from '@/app/actions/roomsigninlists.actions';
import { SignInListType } from '@/app/types/types';

const RoomSignInLists = () => {

  const [showDrawer,setShowDrawer] = useState<boolean>(false);

  const [roomList, setRoomList] = useState<SignInListType[] | []>([]);

  const fetchRoomList = useCallback(async () => {
    try {
        await getRoomList()
        .then((response) => {
            setRoomList(response.data);
        })
    } catch(error) {
        console.log(error);
    }
  },[])

  useEffect(()=>{
      fetchRoomList();
  },[fetchRoomList])

  const roomNameInputTextRef = useRef();
  const addRoomFunction = async (e: any) => {
      e.preventDefault();
      try {
          await postAddRoomList((roomNameInputTextRef as any).current.value);
      } catch(error) {
          console.log(error);
      }
      (roomNameInputTextRef as any).current!.value = "";
      fetchRoomList();
  }

  const roomToDeleteRef = useRef()
  const deleteRoom = async (e: any) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to delete this room? Doing so will delete all room history.")) {
      try {
          await deleteRoom((roomToDeleteRef as any).current.value);
      } catch(error) {
          console.log(error);
      }
      fetchRoomList();
    }
  }

  let router = useRouter();
  const viewRoom = async (e: any) => {
    e.preventDefault();
    let id = e.target.value;
    let path = `./roomsignin/${id}`;
    router.push(path);
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
          <Heading as="h1" size="lg">Rooms</Heading>
        </Box>
        <Container maxW="1080px">
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
          <Container 
            flexDirection="column"
            mt={10} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            border="1px" 
            borderColor="inherit" 
            p={8} 
            rounded="md" 
            boxShadow="sm"
          >
            <TableContainer 
              overflowX="hidden"
              w="100%"
            >
              <Table variant="simple" w="100%" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {roomList.length > 0 && roomList.map((room, i)=>{
                    return (
                      <Tr key={room.id} id={room.id.toString()} className="addRowFade">
                        <Td>{room.name}</Td>
                        <Td textAlign="end"> 
                          <Button 
                            as={Link} 
                            href={`/roomsignin/${room.id}`} me={1} 
                            colorScheme="black"
                            variant="outline"
                            size="sm"
                            _hover={{
                              textDecoration: "none"
                            }}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table> 
            </TableContainer>
          </Container>
        </Container>
        <Drawer 
          isOpen={showDrawer} 
          onClose={()=>setShowDrawer(false)} 
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
                <DrawerHeader 
                  alignSelf="flex-start" 
                  padding="0 0 1rem 0"
                >
                  <Heading 
                    as="h4" 
                    color="black"
                    size="md"
                    _dark={{
                      color: "white"
                    }}
                  >
                    Room
                    </Heading>
                </DrawerHeader>
                <Flex gap={2} mb={3}>
                  <Input 
                    size="sm" 
                    borderColor="black" 
                    color="black"
                    placeholder="Room Name" 
                    type="text" 
                    ref={roomNameInputTextRef as any}
                    _dark={{
                      color: "white"
                    }}
                  />
                  <Button 
                    colorScheme="green"
                    size="sm"
                    type="submit" 
                    onClick={e=>{addRoomFunction(e)}}
                  >
                    Add
                  </Button>
                </Flex>
                <Flex justifyContent="center" w="100%" gap={1}>
                  <Select 
                    size="sm" 
                    color="black"
                    borderColor="black" 
                    ref={roomToDeleteRef as any}
                    _dark={{
                      color: "white"
                    }}
                  >
                    <option value="">Select One</option>
                      {roomList?.length > 0 && roomList?.map((room,i)=>{
                        return (
                          <option
                            key={i}
                            value={room.id}
                          >
                            {room.name}
                          </option>
                        )
                      })}
                  </Select>
                  <Button
                    colorScheme="red"
                    size="sm"
                    type="submit"
                    onClick={e=>deleteRoom(e)}
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

export default RoomSignInLists;