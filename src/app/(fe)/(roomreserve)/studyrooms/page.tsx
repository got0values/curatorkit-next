'use client'

import React, {useState, useEffect, useRef} from 'react'; 
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {BiLinkExternal} from 'react-icons/bi';
import moment from 'moment';
import { 
  Box, 
  Button, 
  Heading,
  Checkbox,
  Input,
  Text,
  Flex,
  Select,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Link,
  useToast
} from "@chakra-ui/react"
import {FaChevronLeft} from 'react-icons/fa';
import showAdminDrawer from '@/app/utils/showAdminDrawer';
import { getStudyRooms, getStudyRoomData } from '@/app/actions/studyrooms.actions';

type StudyRoomType = {
  id: string;
  name: string;
}

export default function StudyRooms() {
  const localizer = momentLocalizer(moment)
  const [showDrawer,setShowDrawer] = useState();

  const toast = useToast();

  

  const [subdomain,setSubdomain] = useState("");
  const [roomList, setRoomList] = useState<StudyRoomType[] | []>([]);
  async function fetchStudyRooms() {
    await getStudyRooms()
      .then((response) => {
          setRoomList(response.data.studyRooms);
          setSubdomain(response.data.subdomain)
      })
      .catch(res=>{
        console.error(res)
      })
  }

  const [requests,setRequests] = useState();
  const [originalRequests,setOriginalRequests] = useState();
  async function fetchStudyRoomData() {
    await getStudyRoomData()
      .then((response) => {
        setRequests(response.data);
        setOriginalRequests(response.data);
      })
      .catch((res)=>{
        console.error(res)
      })
  }

  useEffect(()=>{
      fetchStudyRooms();
      fetchStudyRoomData();
  },[])

  const roomNameInputTextRef = useRef();
  const addRoomFunction = async (e) => {
      e.preventDefault();
      try {
          await axios
          .post(server + "/studyrooms", {
              headers : {
                  'Content-Type':'application/json'
              },
              roomname: JSON.stringify(roomNameInputTextRef.current.value)
          })
      } catch(error) {
          console.log(error);
      }
      roomNameInputTextRef.current.value = "";
      fetchStudyRooms();
  }

  const roomToDeleteRef = useRef()
  const deleteRoom = async (e) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to delete this room? Doing so will delete all room history.")) {
      try {
          await axios
          .delete(server + "/studyrooms", {
              headers : {
                  'Content-Type':'application/json'
              },
              data: {
                roomid: JSON.stringify(roomToDeleteRef.current.value)
              }
          })
      } catch(error) {
          console.log(error);
      }
      fetchStudyRooms();
    }
  }

  const filterRoom = async (e) => {
    e.preventDefault();
    let isChecked = e.target.checked;
    let checked_room_id = e.target.value;
    if (requests && !isChecked) {
      let minusRoom = requests.filter((request)=>(
          request?.study_room_id?.toString() !== checked_room_id
        ));
      setRequests(minusRoom)
    }
    if (requests && isChecked) {
      let plusRoomData = originalRequests.filter((oRequests)=>(
        oRequests?.study_room_id?.toString() === checked_room_id
      ))
      setRequests(requests=>[...requests,plusRoomData[0]])
    }
  }

  const [openModal, setOpenModal] = useState();
  const [modalData, setModalData] = useState({});
  const openEditRoom = async (e) => {
    e.preventDefault();
    const roomid = e.target.dataset.roomid;
    try {
      await axios
      .get(server + `/editstudyroom?roomid=${roomid}`,{
        headers : {
            'Content-Type':'application/json'
        }
      })
      .then((response) => {
        setModalData(response.data)
        setOpenModal(true);
      })
    } catch(error) {
        console.log(error);
    }
  }

  const [requestModalData,setRequestModalData] = useState();
  const [openRequestModal,setOpenRequestModal] = useState();
  function modalOpenForRequest(e) {
    setRequestModalData(e);
    setOpenRequestModal(true);
  }

  function closeRequestModal(e) {
    setRequestModalData(null)
  }

  const formFromRef = useRef();
  const formToRef = useRef();
  const confirmedRef = useRef();
  async function updateReserve(e) {
    e.preventDefault();
    const formFrom = formFromRef.current.value;
    const formTo = formToRef.current.value;
    const confirmed = confirmedRef.current.checked;
    const formDataId = e.target.dataset.formdataid
    try {
      await axios
      .put(server + "/editstudyroomformdata", {
          headers : {
              'Content-Type':'application/json'
          },
          form_from: formFrom,
          form_to: formTo,
          confirmed: confirmed,
          form_data_id: formDataId
      })
      .then((response)=>{
        if (response.data == "OK") {
          window.alert("Updated")
          fetchStudyRoomData();
          closeRequestModal();
        }
        else {
          window.alert("Unexpected error! Please try again.")
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  async function deleteReserve(e) {
    e.preventDefault();
    const formDataId = e.target.dataset.formdataid;
    try {
        await axios
        .delete(server + "/studyroomformdata", {
            headers : {
                'Content-Type':'application/json'
            },
            data: {
              form_id: formDataId
            }
        })
        .then((response)=>{
          if (response.data == "OK") {
            window.alert("Deleted")
            fetchStudyRoomData();
            closeRequestModal();
          }
          else {
            window.alert("Unexpected error! Please try again.")
          }
        })
    } catch(error) {
        console.log(error);
    }
  }

  const [errorMsg,setErrorMsg] = useState();
  const studyRoomNameRef = useRef();
  const studyRoomFormRef = useRef();
  const studyRoomDescriptionRef = useRef();
  const studyRoomMinCapRef = useRef();
  const studyRoomMaxCapRef = useRef();
  async function updateStudyRoom(e) {
    e.preventDefault();
    const roomName = studyRoomNameRef.current.value;
    const roomForm = studyRoomFormRef.current.value;
    const roomDesc = studyRoomDescriptionRef.current.value;
    const roomMin = studyRoomMinCapRef.current.value;
    const roomMax = studyRoomMaxCapRef.current.value;
    const roomId = e.target.value;
    if (roomName !== "") {
      try {
        await axios
        .put(server + "/editstudyroom", {
            studyroomname: roomName,
            studyroomformid: roomForm,
            studyroomid: roomId,
            studyroomdesc: roomDesc,
            studyroommin: roomMin,
            studyroommax: roomMax
            
        })
        .then((response)=>{
          if (response.data === "OK") {
            closeModal();
            toast({
              title: 'Saved',
              description: "Study room details have been updated.",
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
          }
          else {
            setErrorMsg(response.data)
          }
        })
      } catch(error) {
          console.log(error);
          toast({
            title: 'Error!',
            description: error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
      }
    }
    else {
      if (roomName === "") {
        setErrorMsg("Please enter a room name")
        toast({
          title: 'Error!',
          description: "Please enter a room name",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  const closeModal = () => {
    setOpenModal(false);
    setModalData({});
    setErrorMsg(null);
    fetchStudyRooms();
  }

  return (
    <>
      <Flex 
        id="main"
        flexDirection="column"
      >
        <Box 
          mt={3}
          pb={4}
          w="100%"
          position="relative"
        >
          <Flex w="100%" color="grey" alignItems="center">
            <Box id="vr"></Box>
          </Flex>
          <Flex me={5} gap={2} alignItems="center">
            <Heading as="h1" size="lg">Study Rooms</Heading>
            <Link 
              href={`https://${subdomain}.curatorkit.com/roomreserve/studyroom`} 
              target="_blank" 
              rel="noreferrer"
            >
              <Button
                bgColor="transparent"
                fontSize="lg"
                title={`https://${subdomain}.curatorkit.com/roomreserve/studyroom`}
                p={0}
              >
                <BiLinkExternal/>
              </Button>
            </Link>
          </Flex>
        </Box>
        <Box
          height="100%"
          width="100%"
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
            onClick={()=>showAdminDrawer(setShowDrawer)}
          >
            <FaChevronLeft/>
          </Button>

          <Flex
            alignItems="flex-start"
            flexWrap="wrap"
            height="100%"
            position="relative"
            pt={5}
            gap={3}
          >
            <Box  
              flex="1 0 auto"
              p={4} 
              rounded="md" 
              backgroundColor="#f7f7f7"
              _dark={{
                backgroundColor: "gray.700",
                color: "white"
              }}
            >
              <Heading
                size="md"
                pb={2}
                borderBottom="1px solid"
                borderBottomColor="gray.400"
                mb={2}
              >
                Rooms
              </Heading>
              <Flex
               flexDirection="column"
               gap={2}
              >
                {roomList.length > 0 && roomList.map((room, i)=>{
                  return (
                    <Box 
                      key={room.id} 
                      id={room.id} 
                      className="addRowFade"
                    >

                      <Flex
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Button 
                          size="sm"
                          backgroundColor="transparent"
                          onClick={e=>openEditRoom(e)} 
                          data-roomid={room.id}
                        >
                          {room.name}
                        </Button>
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          flexBasis="50%"
                        > 
                          <Checkbox 
                            backgroundColor="white"
                            onChange={e=>filterRoom(e)} 
                            value={room.id}
                            defaultChecked={true}
                          >
                          </Checkbox>
                        </Flex>
                      </Flex>

                    </Box>
                  )
                })}
              </Flex>
            </Box>
            <Box
              flex="1 0 80%"
              h="100%"
              overflow="auto"
              px={3}
              pb={5}
            >
              <Box 
                as={BigCalendar}
                localizer={localizer}
                events={requests}
                onSelectEvent={()=>modalOpenForRequest()}
                sx={{
                  '& .rbc-toolbar-label': {
                    fontWeight: '900',
                    fontSize: '1.5rem',
                    marginBottom: '.5rem'
                  },
                  '& .rbc-today': {
                    bg: 'lightblue'
                  },
                  '& .rbc-off-range-bg': {
                    bg: 'transparent'
                  }
                }}
              />
            </Box>
          </Flex>
        </Box>
        <Drawer 
          isOpen={showDrawer} 
          onClose={e=>setShowDrawer(false)} 
          scroll="true"
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
                    Study Room
                    </Heading>
                </DrawerHeader>
                <Flex gap={2} mb={3}>
                  <Input 
                    size="sm" 
                    borderColor="black" 
                    color="black"
                    placeholder="Study Room" 
                    type="text" 
                    ref={roomNameInputTextRef}
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
                    ref={roomToDeleteRef}
                    _dark={{
                      color: "white"
                    }}
                  >
                    <option value="">Select One</option>
                      {roomList?.length > 0 && roomList?.map((room,i)=>{
                        return (
                          <option
                            key={i}
                            value={room.roomid}
                          >
                            {room.roomname}
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

        {modalData ? (
        <Modal isOpen={openModal} onClose={closeModal} isCentered>
          <ModalOverlay/>
          <ModalContent>
            <ModalCloseButton/>
            <ModalHeader borderBottom="1px solid lightgray">
              <Heading as="h4" size="md">{modalData?.studyroom?.name}</Heading>
            </ModalHeader>
            <ModalBody pb="1.5rem" px="1.5rem">

              <FormLabel mt={5} htmlFor="studyRoomName">Name:</FormLabel>
              <Input 
                type="text" 
                id="studyRoomName"
                defaultValue={modalData?.studyroom?.name}
                ref={studyRoomNameRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomDescription">Description:</FormLabel>
              <Textarea 
                id="studyRoomDescription"
                defaultValue={modalData?.studyroom?.description}
                ref={studyRoomDescriptionRef}
              >
              </Textarea>
              <FormLabel mt={5} htmlFor="studyRoomMinCap">Minimum capacity:</FormLabel>
              <Input 
                type="number" 
                id="studyRoomMinCap"
                min="0"
                defaultValue={modalData?.studyroom?.minimum_capacity}
                ref={studyRoomMinCapRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomMaxCap">Maximum capacity:</FormLabel>
              <Input 
                type="number" 
                id="studyRoomMaxCap"
                min="0"
                defaultValue={modalData?.studyroom?.maximum_capacity}
                ref={studyRoomMaxCapRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomForm">Form:</FormLabel>
              <Select
                id="studyRoomForm"
                ref={studyRoomFormRef}
                defaultValue={modalData?.studyroom?.form}
              >
                <option value="Select One">Select One</option>
                {modalData?.forms?.map((form,i)=>{
                  return (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  )
                })}
              </Select>
              <Flex mt={5} justifyContent="flex-end" gap={3}>
                <Text
                  color="red"
                >
                  {errorMsg !== null ? errorMsg : null}
                </Text>
                <Button
                  colorScheme="green"
                  value={modalData?.studyroom?.id}
                  onClick={e=>updateStudyRoom(e)}
                >
                  Submit
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
        ) : null}

        {requestModalData ? (
        <Modal isOpen={openRequestModal} onClose={closeRequestModal} isCentered>
          <ModalOverlay/>
          <ModalContent>
            <ModalCloseButton/>
            <ModalHeader borderBottom="1px solid lightgray">
              <Heading as="h4" size="md">{requestModalData.title}</Heading>
            </ModalHeader>
            <ModalBody pb="1.5rem" px="1.5rem">

              {/* <Input type="hidden" value={modalData.roomname} ref={regFormRoomNameRef}/>
              <Input type="hidden" value={modalData.roomid} ref={regFormRoomIdRef}/> */}
              <Box>

                <Box my={5}>
                  {/* {Object.entries(requestModalData.form_data.formData).map((data,i)=>{
                    return (
                      <Box key={i}>
                        {Object.values(data)[0]}: {Object.values(data)[1]}
                      </Box>
                    )
                  })} */}
                  {Object.entries(requestModalData.form_data.schema.properties).map((datakey,i)=>{
                    return (
                      <Flex key={i} alignItems="center" gap={2}>
                        <Text fontWeight="700">
                          {Object.values(datakey)[0]}:
                        </Text>
                        <Text>
                          {Object.entries(requestModalData.form_data.formData).map((datavalue,i)=>{
                          return (
                              <Text as="span" key={i}>
                                {Object.values(datavalue)[0] === Object.values(datakey)[0] ? Object.values(datavalue)[1] : null}
                              </Text>
                            )
                          })}
                        </Text>
                      </Flex>
                    )
                  })}
                </Box>

                <Flex
                  alignItems="center"
                  mt={3}
                  flexWrap="wrap"
                >
                  <FormLabel 
                    htmlFor="datetimeFrom" 
                    flex="1 1 auto" 
                    w="10%"
                  >
                    From:
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    id="datetimeFrom"
                    defaultValue={requestModalData.start}
                    ref={formFromRef}
                    flex="1 0 80%"
                  />
                </Flex>
                <Flex
                  alignItems="center"
                  mt={3}
                  flexWrap="wrap"
                >
                  <FormLabel 
                    htmlFor="datetimeTo" 
                    flex="1 1 auto" 
                    w="10%"
                  >
                    To:
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    id="datetimeTo"
                    defaultValue={requestModalData.end}
                    ref={formToRef}
                    flex="1 0 80%"
                  />
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  mt={5}
                  flexWrap="wrap"
                >
                  <Checkbox
                    defaultChecked={requestModalData.confirmed === true ? 1 : 0}
                    ref={confirmedRef}
                  >
                    Confirmed?
                  </Checkbox>
                </Flex>
                <Flex alignItems="center" justifyContent="space-between" mt={5}>
                  <Button
                    colorScheme="red"
                    data-formdataid={requestModalData.id}
                    onClick={e=>deleteReserve(e)}
                  >
                    Delete
                  </Button>
                  <Button
                    colorScheme="green"
                    data-formdataid={requestModalData.id}
                    onClick={e=>updateReserve(e)}
                  >
                    Update
                  </Button>
                </Flex>
              </Box>

            </ModalBody>
          </ModalContent>
        </Modal>
        ) : null}
      </Flex>
    </>
  )
}