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
import { getStudyRooms, getStudyRoomData, postSaveStudyRoom, deleteStudyRoom, getEditStudyRoom, deleteStudyRoomReserve, putEditStudyRoomFormData, putEditStudyRoom } from '@/app/actions/studyrooms.actions';
import { StudyRoomFormDataType, StudyRoomType, ReserveFormType } from '@/app/types/types';
import { parse } from 'flatted';

export default function StudyRooms() {
  const localizer = momentLocalizer(moment)
  const [showDrawer,setShowDrawer] = useState(false);

  const toast = useToast();

  const [subdomain,setSubdomain] = useState("");
  const [roomList, setRoomList] = useState<StudyRoomType[] | []>([]);
  async function fetchStudyRooms() {
    await getStudyRooms()
      .then((response) => {
          const data = response.data as { studyRooms: StudyRoomType[], subdomain: string };
          setRoomList(data.studyRooms);
          setSubdomain(data.subdomain)
      })
      .catch(res=>{
        console.error(res)
      })
  }

  const [requests,setRequests] = useState<StudyRoomFormDataType[] | []>([]);
  const [originalRequests,setOriginalRequests] = useState<StudyRoomFormDataType[] | []>([]);
  async function fetchStudyRoomData() {
    await getStudyRoomData()
      .then((response) => {
        if (response.success) {
          const data = response.data as StudyRoomFormDataType[];
          setRequests(data);
          setOriginalRequests(data);
        }
        else {
          console.error(response)
          toast({
            title: 'Error!',
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          title: 'Error!',
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  useEffect(()=>{
      fetchStudyRooms();
      fetchStudyRoomData();
  },[])

  const roomNameInputTextRef = useRef<any>();
  const addRoomFunction = async () => {
    await postSaveStudyRoom(roomNameInputTextRef.current.value)
      .then((res)=>{
        if (res.success) {
          roomNameInputTextRef.current.value = "";
          fetchStudyRooms();
        }
        else {
          console.error(res.message)
          toast({
            title: 'Error!',
            description: res.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          title: 'Error!',
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const roomToDeleteRef = useRef()
  const deleteRoom = async () => {
    if(window.confirm("Are you sure you want to delete this room? Doing so will delete all room history.")) {
      await deleteStudyRoom((roomToDeleteRef.current as any).value.toString())
        .then((res)=>{
          if (res.success) {
            fetchStudyRooms()
          }
          else {
            console.error(res.message);
            toast({
              title: 'Error!',
              description: res.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
        })
      .catch((error)=>{
        console.error(error)
        toast({
          title: 'Error!',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
    }
  }

  const filterRoom = async (e: any) => {
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
      let plusRoomData = originalRequests?.filter((oRequests)=>(
        oRequests?.study_room_id?.toString() === checked_room_id
      ))
      setRequests(requests=> [...requests,plusRoomData[0]])
    }
  }

  type ModalDataType = {
    studyRoom: StudyRoomType,
    forms: ReserveFormType[]
  }

  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState<ModalDataType | null>(null);
  const openEditRoom = async (e: any) => {
    const roomid = e.target.dataset.roomid;
    await getEditStudyRoom(roomid)
      .then((response) => {
        if (response.success) {
          const data = response.data as ModalDataType;
          setModalData(data)
          setOpenModal(true);
        }
        else {
          console.error(response)
          toast({
            title: 'Error!',
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          title: 'Error!',
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const [requestModalData,setRequestModalData] = useState<StudyRoomFormDataType | null>(null);
  const [openRequestModal,setOpenRequestModal] = useState(false);
  function modalOpenForRequest(e: any) {
    setRequestModalData(e);
    setOpenRequestModal(true);
  }

  function closeRequestModal() {
    setRequestModalData(null)
  }

  const formFromRef = useRef<any>();
  const formToRef = useRef<any>();
  const confirmedRef = useRef<any>();
  async function updateReserve(e: any) {
    e.preventDefault();
    const formFrom = formFromRef.current.value;
    const formTo = formToRef.current.value;
    const confirmed = confirmedRef.current.checked;
    const formDataId = e.target.dataset.formdataid
    await putEditStudyRoomFormData(formFrom, formTo, confirmed, formDataId)
      .then((response)=>{
        if (response.success) {
          toast({
            description: "Updated!",
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          fetchStudyRoomData();
          closeRequestModal();
        }
        else {
          toast({
            title: 'Error!',
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          title: 'Error!',
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  async function deleteReserve(e: any) {
    e.preventDefault();
    const formDataId = e.target.dataset.formdataid;
    await deleteStudyRoomReserve(formDataId)
      .then((response)=>{
        if (response.success) {
          toast({
            description: "Deleted reserve",
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          fetchStudyRoomData();
          closeRequestModal();
        }
        else {
          console.error(response);
          toast({
            title: 'Error!',
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
          title: 'Error!',
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const [errorMsg,setErrorMsg] = useState("");
  const studyRoomNameRef = useRef<any>();
  const studyRoomFormRef = useRef<any>();
  const studyRoomDescriptionRef = useRef<any>();
  const studyRoomMinCapRef = useRef<any>();
  const studyRoomMaxCapRef = useRef<any>();
  async function updateStudyRoom(e: any) {
    e.preventDefault();
    const roomName = studyRoomNameRef.current.value;
    const roomForm = studyRoomFormRef.current.value;
    const roomDesc = studyRoomDescriptionRef.current.value;
    const roomMin = studyRoomMinCapRef.current.value;
    const roomMax = studyRoomMaxCapRef.current.value;
    const roomId = e.target.value;
    if (roomName !== "") {
      await putEditStudyRoom(roomName, roomForm, roomId, roomDesc, roomMin, roomMax)
        .then((response)=>{
          if (response.success) {
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
            setErrorMsg(response.data as string)
          }
        })
        .catch((error)=>{
          console.log(error);
          toast({
            title: 'Error!',
            description: error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        })
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
    setModalData(null);
    setErrorMsg("");
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
            zIndex={10}
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
                      id={room.id.toString()} 
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
              minH='82vh'
              height='82vh'
              maxHeight='82vh'
              padding='1rem'
            >
              <Box 
                as={BigCalendar}
                localizer={localizer}
                events={requests}
                onSelectEvent={(e: any)=>modalOpenForRequest(e)}
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
                    ref={roomNameInputTextRef as any}
                    _dark={{
                      color: "white"
                    }}
                  />
                  <Button 
                    colorScheme="green"
                    size="sm"
                    type="submit" 
                    onClick={()=>{addRoomFunction()}}
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
                    onClick={()=>deleteRoom()}
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
              <Heading as="h4" size="md">{modalData?.studyRoom?.name}</Heading>
            </ModalHeader>
            <ModalBody pb="1.5rem" px="1.5rem">

              <FormLabel mt={5} htmlFor="studyRoomName">Name:</FormLabel>
              <Input 
                type="text" 
                id="studyRoomName"
                defaultValue={modalData?.studyRoom?.name}
                ref={studyRoomNameRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomDescription">Description:</FormLabel>
              <Textarea 
                id="studyRoomDescription"
                defaultValue={modalData?.studyRoom?.description as string}
                ref={studyRoomDescriptionRef}
              >
              </Textarea>
              <FormLabel mt={5} htmlFor="studyRoomMinCap">Minimum capacity:</FormLabel>
              <Input 
                type="number" 
                id="studyRoomMinCap"
                min="0"
                defaultValue={modalData?.studyRoom?.minimum_capacity as number}
                ref={studyRoomMinCapRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomMaxCap">Maximum capacity:</FormLabel>
              <Input 
                type="number" 
                id="studyRoomMaxCap"
                min="0"
                defaultValue={modalData?.studyRoom?.maximum_capacity as number}
                ref={studyRoomMaxCapRef}
              />
              <FormLabel mt={5} htmlFor="studyRoomForm">Form:</FormLabel>
              <Select
                id="studyRoomForm"
                ref={studyRoomFormRef}
                defaultValue={modalData?.studyRoom?.form as number}
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
                  value={modalData?.studyRoom?.id}
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
              <Heading as="h4" size="md">{requestModalData.study_room_name}</Heading>
            </ModalHeader>
            <ModalBody pb="1.5rem" px="1.5rem">
                <Box my={5}>
                  {/* {Object.entries(requestModalData.form_data.formData).map((data,i)=>{
                    return (
                      <Box key={i}>
                        {Object.values(data)[0]}: {Object.values(data)[1]}
                      </Box>
                    )
                  })} */}
                  {Object.entries(parse(requestModalData.form_data!).schema.properties).map((datakey,i)=>{
                    return (
                      <Flex key={i} alignItems="center" gap={2}>
                        <Text fontWeight="700">
                          {Object.values(datakey)[0] as any}:
                        </Text>
                        <Text>
                          {Object.entries(parse(requestModalData.form_data!).formData).map((datavalue,i)=>{
                          return (
                              <Text as="span" key={i}>
                                {Object.values(datavalue)[0] === Object.values(datakey)[0] ? Object.values(datavalue)[1] as any : null}
                              </Text>
                            )
                          })}
                        </Text>
                      </Flex>
                    )
                  })}
                </Box>


              <Box>
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
                    defaultValue={requestModalData.request_datetime_from.toString()}
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
                    defaultValue={requestModalData.request_datetime_to.toString()}
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
                    defaultChecked={requestModalData.confirmed ? true : false}
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