'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import moment from 'moment';
import {GrFormAdd} from 'react-icons/gr';
import {GrFormView} from 'react-icons/gr'
import { 
  Box, 
  Flex,
  Icon,
  Button, 
  Container, 
  Textarea,
  FormControl,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Link, 
  useToast
} from "@chakra-ui/react"
import {AiOutlineArrowLeft} from 'react-icons/ai';
import { getRoomSignIns, postSignIn, deleteSignIn, postNotes, deleteNote } from '@/app/actions/roomsignin.actions';
import { SignInType } from '@/app/types/types';

const RoomSignIn = ({params}: {params: {slug: string}}) => {
  let roomId = params.slug;

  const toast = useToast();

  const [allowed, setAllowed] = useState(true);
  const [roomName, setRoomName] = useState();
  const [signIn, setSignIn] = useState<SignInType[] | []>([]);
  const fetchSignIn = useCallback(async () => {
    try {
      await getRoomSignIns(roomId)
        .then((response) => {
          if (!response.data) {
            setAllowed(false)
          }
          else {
            setSignIn(response.data.signIns);
            setRoomName(response.data.roomName)
          }
        })
        .catch((error)=>{
          toast({
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          console.error(error)
        })
    } catch(error) {
      toast({
        description: "Error",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
  },[roomId])

  useEffect(()=>{
    fetchSignIn();
  },[fetchSignIn])

  const bcInputTextRef = useRef();
  const [input, setInput] = useState<string>("");
  const bcInputFunction = async (e: any) => {
    e.preventDefault();
    try {
      await postSignIn(roomId, input)
      .then(()=>{
        setInput("")
      })
      .catch((res)=>{
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
        console.log(res)
      })
    } 
    catch(error) {
      toast({
        description: "Error",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
    (bcInputTextRef as any).current.value = "";
    fetchSignIn();
    (bcInputTextRef as any).current.focus();
  }

  const removeSignIn = async (e: any) => {
      e.preventDefault();
      try {
        await deleteSignIn(e.target.value, roomId)
          .catch((error)=>{
            toast({
              description: error.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
            console.error(error)
          })
      } 
      catch(error) {
        toast({
          description: "Error",
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
          console.log(error);
      }
      fetchSignIn();
  }

  const [notesInput, setNotesInput] = useState<string>("");
  const addNotes = async (e: any) => {
    e.preventDefault();
    try {
      await postNotes(notesInput, e.target.value)
        .then(()=>{
          fetchSignIn();
          closeModal()
        })
        .catch((error)=>{
          toast({
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          console.error(error)
        })
    } catch(error) {
      toast({
        description: "Error",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
        console.log(error);
    }
  }

  const removeNote = async (e: any) => {
    e.preventDefault();
    try {
      await deleteNote(modalTransId, roomId)
        .catch((error)=>{
          toast({
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          console.error(error)
        })
    } catch(error) {
      toast({
        description: "Error",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
        console.log(error);
    }
    fetchSignIn();
    closeModal();
  }

  const [isEditable, setIsEditable] = useState(false);
  const isEditableToggle = () => {
    setIsEditable(true)
  }

  const [openModal, setOpenModal] = useState(false);
  const [modalTransId, setModalTransId] = useState<string>("");
  const [modalText, setModalText] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalDate, setModalDate] = useState<string>("");
  const [modalTime, setModalTime] = useState<string>("");
  const modalOpenView = (e: any) => {
    setModalText(e.target.dataset.notestext);
    e.target.getAttribute("data-title") !== null ? setModalTitle(e.target.dataset.title) : setModalTitle("Sign In Notes");
    setModalTransId(e.target.dataset.transid);
    setModalDate(moment(e.target.dataset.datetime).format('MMM d, YYYY'));
    setModalTime(moment(e.target.dataset.datetime).format('h:m A'));
    setOpenModal(true);
  }

  const modalOpenAdd = (e: any) => {
    setModalTitle("Sign In Notes");
    setModalTransId(e.target.dataset.transid);
    setModalDate(moment(e.target.dataset.datetime).format('MMM d, YYYY'));
    setModalTime(moment(e.target.dataset.datetime).format('h:m A'));
    setOpenModal(true);
  }

  const closeModal = () => {
    setIsEditable(false)
    setOpenModal(false);
    setModalText("");
  }

  return (
    <>
      {allowed ? (
        <>
          <Box 
            id="main"
            sx={{
              '& #signin-container': {
                position: 'relative'
              },
              '& #signin-list-input': {
                justifyContent: 'center'
              },
              '@media screen and (max-width: 700px)': {
                '& .signin-breadcrumb': {
                  display: 'none',
                }
              },
              '& .notes-text': {
                width: '20em',
                height: '2em',
                lineHeight: '2em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                backgroundColor: 'rgb(247, 247, 247)',
                boxShadow: '1px 1px 1px grey',
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: '5px',
                paddingLeft: '1em',
                paddingRight: '1em',
                color: 'black'
              },
              '& .notes-text:hover': {
                boxShadow: '1px 1px 5px grey',
                cursor: 'pointer'
              }
            }}
          >
            <Box 
              mt={4}
              pb={3}
              w="100%"
              position="relative"
            >
              <Box id="vr"></Box>
              <Heading as="h1" size="lg">Room Sign In</Heading>
            </Box>
            <Box
              position="relative"
            >
              <Box position="absolute" top={0}>
                <Link 
                  href="/roomsigninlists"
                >
                  <Button 
                    color="grey" 
                    ms={1}
                    fontSize="md" 
                    bgColor="transparent"
                    p={0}
                    h="1.75rem"
                    // onClick={e=>setPageIsEditableForEvent(false)}
                  >
                    <AiOutlineArrowLeft/> <Text as="span" ms={1}>Back to Rooms</Text>
                  </Button>
                </Link>
              </Box>
              <Container 
                maxW="1080px"
                id='signin-container'
                mt={3}
              >
                <Flex flexDirection="column" alignItems="center" flex="0 0 33%">
                  <Heading
                    as="h2"
                    size="lg"
                  >
                    {roomName} 
                  </Heading>
                  <Heading 
                    as="h3"
                    size="md"
                  >
                    {new Date().toDateString()}
                  </Heading>
                </Flex>
                <Box 
                  mb={3}
                >
                  <FormControl>
                    <Input 
                      type="text" 
                      ref={bcInputTextRef as any} 
                      width="auto"
                      maxW="300px"
                      size="sm"
                      placeholder="Barcode" 
                      id="bcInput" 
                      me={2}
                      onKeyDown={e=>e.key==='Enter' ? bcInputFunction(e) : null}
                      onChange={e=>setInput(e.target.value)} 
                      autoFocus
                      autoComplete="off"
                    />
                    <Button 
                      colorScheme="black"
                      variant="outline"
                      size="sm"
                      onClick={e=>bcInputFunction(e)}>
                      Submit
                    </Button>
                  </FormControl>
                </Box>
                <Box overflow="auto">
                  <Table 
                    size="sm"
                  >
                      <Thead>
                        <Tr>
                          <Th textAlign="center">#</Th>
                          <Th textAlign="center">Delete</Th>
                          <Th textAlign="center">Barcode</Th>
                          <Th textAlign="center">Name</Th>
                          <Th textAlign="center">Date</Th>
                          <Th textAlign="center">Time</Th>
                          <Th textAlign="center">Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                          {signIn.length > 0 && signIn.map((si, i)=>{
                              return (
                                <Tr 
                                  key={si.transId} 
                                  id={si.transId.toString()} 
                                >
                                    <Td textAlign="center">
                                      <Text
                                        color="gray"
                                      >
                                        {signIn.length - i}
                                      </Text>
                                    </Td>
                                    <Td textAlign="center"> 
                                        <Button 
                                          colorScheme="red"
                                          size="sm"
                                          onClick={e=>removeSignIn(e)} 
                                          value={si.transId}
                                        >
                                          Delete
                                        </Button>
                                    </Td>
                                    <Td textAlign="center">{si.card}</Td>
                                    <Td textAlign="center">{si.name}</Td>
                                    <Td textAlign="center">
                                      {moment.utc(si.datetime).local().format('MMM D, Y')}
                                    </Td>
                                    <Td textAlign="center">{moment.utc(si.datetime).local().format('h:mm A')}</Td>
                                    <Td textAlign="center">
                                        <Flex 
                                          alignItems="center"
                                          justifyContent="center"
                                        >
                                          <Box>
                                            {si["notes"] === null && si.notes !== "" ? (
                                            <Button 
                                              colorScheme="black"
                                              variant="outline"
                                              size="sm"
                                              data-transid={si.transId}
                                              onClick={e=>modalOpenAdd(e)}
                                            >
                                              <Icon as={GrFormAdd}/>Add
                                            </Button>
                                            ) : (
                                            <Button 
                                              colorScheme="black"
                                              variant="outline"
                                              size="sm"
                                              data-transid={si.transId}
                                              data-title={si.name} 
                                              data-datetime={si.datetime}
                                              data-notestext={si["notes"]}
                                              onClick={e=>modalOpenView(e)}
                                            >
                                              <Icon as={GrFormView}/>View
                                            </Button>
                                            )}
                                          </Box>
                                        </Flex>
                                    </Td>
                                </Tr>
                              )
                          })}
                      </Tbody>
                  </Table>
                </Box>
              </Container>
            </Box>
          </Box>
          <Modal isOpen={openModal} onClose={closeModal} isCentered>
            <ModalOverlay/>
            <ModalContent minH="25vh">
              <ModalCloseButton/>
              <ModalHeader>
                <Heading as="h4" size="md">{modalTitle}</Heading>
                <Heading as="h6" size="sm">{modalDate} {modalTime}</Heading>
              </ModalHeader>
              <ModalBody>
              {!isEditable ? (
                <Box onClick={e=>isEditableToggle()}>
                  {modalText}
                </Box>
                ) : (
                <Textarea 
                  width="100%"
                  height={10}
                  onChange={e=>setNotesInput(e.target.value)}
                >
                  {modalText}
                </Textarea>
                )}
              </ModalBody>
              <ModalFooter>
                <Flex alignItems="center" gap={1}>
                {isEditable ? (
                <>
                  <Button 
                    value={modalTransId}
                    colorScheme="green"
                    onClick={e=>addNotes(e)}
                  >
                    Save
                  </Button>
                  <Button 
                    colorScheme="gray"
                    onClick={e=>setIsEditable(false)}
                  >
                    Cancel
                  </Button>
                </>
                ) : (
                  <Button 
                    colorScheme="yellow"
                    onClick={e=>setIsEditable(true)}
                    >
                    Edit
                  </Button>
                )}
                  <Button 
                    colorScheme="red"
                    data-transid={modalTransId} 
                    onClick={e=>removeNote(e)}
                  >
                    Delete
                  </Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Box textAlign="center" id="main">
          <Heading as="h1" size="lg">Unauthorized</Heading>
        </Box>
      )}
    </>
  )
}

export default RoomSignIn;