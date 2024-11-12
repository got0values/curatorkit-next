'use client'

import {useState,useEffect,useRef,useCallback} from 'react';
import { useCustomTheme } from '@/app/hooks/useCustomTheme';
import { 
  useColorMode,
  Box, 
  Flex,
  Button, 
  Container, 
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormLabel,
  useToast
} from "@chakra-ui/react";
import JSONSchemaForm from "@rjsf/core";
import { StudyRoomDTOType } from '@/app/types/types';
import { getStudyRoomsFe, postStudyRoomFeRegData } from '@/app/actions/festudyrooms.actions';
import validator from '@rjsf/validator-ajv8';
import '../../../css/form-bs.css';
import {stringify} from 'flatted';

export default function StudyRoomReserve() {
  const toast = useToast();
  const {primaryColor,secondaryColor} = useCustomTheme();
  const subdomain = window.location.host.split(".")[0]

  const [studyRooms,setStudyRooms] = useState<StudyRoomDTOType[] | []>([]);
  async function fetchStudyRooms() {
    await getStudyRoomsFe(subdomain)
      .then((response) => {
        if (response.success) {
          setStudyRooms(response.data);
        }
        else {
          console.error(response)
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      })
  }

  useEffect(()=>{
    fetchStudyRooms()
  },[])

  type ModalDataType = {
    reserveform: string;
    reserveformid: string;
    roomname: string;
    roomid: string;
  }

  const initialRef = useRef(null)
  const [modalData,setModalData] = useState<ModalDataType | null>(null);
  const [openFormModal,setOpenFormModal] = useState(false)
  const openRegForm = (e: any) => {
    const reserveform = e.target.dataset.reserveform
    if (reserveform !== "null") {
      const reserveformid = e.target.dataset.reserveformid;
      const roomname = e.target.dataset.roomname;
      const roomid = e.target.dataset.roomid;
      setModalData({
        reserveform: reserveform, 
        reserveformid: reserveformid,
        roomname: roomname, 
        roomid: roomid
      });
      setOpenFormModal(true);

      setTimeout(function(){
        const submitFormButton: HTMLElement | null = document.querySelector('button[type="submit"].btn-info');
        if (submitFormButton) {
          submitFormButton.setAttribute("aria-label","submit");
          (submitFormButton.parentNode as HTMLElement).style.display = "flex";
          (submitFormButton.parentNode as HTMLElement).style.justifyContent = "flex-end";
        }
      },100)
    }
    else {
      window.alert("No reservations available")
    }
  }

  function closeFormModal() {
    setOpenFormModal(false)
    setRegFormErrorMsg("")
    setModalData(null)
  }

  const [regFormErrorMsg,setRegFormErrorMsg] = useState("");
  const regFormIdRef = useRef<any>();
  const regFormDateRef = useRef<any>();
  const regFormTimeFromRef = useRef<any>();
  const regFormTimeToRef = useRef<any>();
  const regFormRoomNameRef = useRef<any>();
  const regFormRoomIdRef = useRef<any>();
  const submitRegForm = useCallback(async (e: any) => {
    const regformid = regFormIdRef.current.value;
    const regformroomname = regFormRoomNameRef.current.value;
    const regformroomid = regFormRoomIdRef.current.value;
    const regformdate = regFormDateRef.current.value;
    const regformtimefrom = regFormTimeFromRef.current.value;
    const regformtimeto = regFormTimeToRef.current.value;
    await postStudyRoomFeRegData(stringify(e), regformid, regformroomname, regformroomid, regformdate, regformtimefrom, regformtimeto, subdomain)
      .then((response)=>{
        if (response.success) {
          window.alert("Reservation form submitted")
          closeFormModal();
        }
        else {
          setRegFormErrorMsg(response.data)
          toast({
            description: response.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      })
  },[])

  return (
    <>
      <Container 
        maxW="1200px" 
        as="main"
      >
        <a id="skip-nav" tabIndex={-1} className="visually-hidden">Main content</a>
        <Box
          borderBottom="1px solid grey"
          py={3}
        >
          <Heading
            as="h2"
            size="md"
          >
            Reserve a Study Room
          </Heading>
        </Box>
        <Box
          pb={20}
          mt={5}
        >
          <Flex
            justifyContent="flex-start"
            flexWrap="wrap"
            gap="4"
            mb="3"
            bg="#f7f7f7"
            p={5}
            rounded="md"
            height="fit-content"
            _dark={{
              bg: "whiteAlpha.200"
            }}
          >
            {studyRooms?.length ? (
              studyRooms.map((studyRoom,i)=>{
                return (
                  <Flex 
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    p={5} 
                    shadow='md' 
                    borderWidth='1px'
                    rounded="md"
                    bg="white"
                    w="360px"
                    minH="350px"
                    key={studyRoom.id}
                    _dark={{
                      bg: "gray.800"
                    }}
                  >
                    <Heading 
                      fontSize='xl'
                      w="100%"
                      textAlign="center"
                    >
                      {studyRoom.name}
                    </Heading>
                    <Text mt={4}>{studyRoom.description}</Text>
                    <Box
                      w="100%"
                      rounded="sm"
                    >
                      <Text 
                        fontWeight="800"
                        my={2}
                      >
                        Minimum capacity: 
                        <Text 
                          as="span" 
                          fontWeight="400"
                          ms={5}
                        >
                          {studyRoom.minimum_capacity}
                        </Text>
                      </Text>
                      <Text 
                        fontWeight="800"
                        my={2}
                      >
                        Maximum capacity: 
                        <Text 
                          as="span" 
                          fontWeight="400"
                          ms={5}
                        >
                          {studyRoom.maximum_capacity}
                        </Text>
                      </Text>
                    </Box>

                      <Button
                        color="white"
                        backgroundColor={primaryColor}
                        w="100%"
                        aria-label="Reserve Room"
                        aria-describedby="reserve-button-desc"
                        _hover={{
                          // backgroundColor: "white",
                          // border: "1px solid black",
                          // color: "black"
                          backgroundColor: secondaryColor,
                          // border: "1px solid black",
                          color: "white"
                        }}
                        data-reserveform={JSON.stringify(studyRoom.form)}
                        data-reserveformid={studyRoom.formId}
                        data-roomname={studyRoom.name}
                        data-roomid={studyRoom.id}
                        onClick={e=>openRegForm(e)}
                      >
                        Reserve
                        <Text as="span" className="visually-hidden" id="reserve-button-desc">Reserve {studyRoom.name}</Text>
                      </Button>

                  </Flex>
                )
              })
            ): null}

          </Flex>
        </Box>
      </Container>
      {modalData && JSON.parse(modalData.reserveform) ? (
        <Modal 
          isOpen={openFormModal} 
          onClose={closeFormModal} 
          aria-label={modalData ? modalData.roomname : "Registration Form"}
          initialFocusRef={initialRef}
          isCentered
        >
          <ModalOverlay/>
          <ModalContent
            ref={initialRef}
            sx={{
              '.element-and-tooltip': {
                marginTop: 'auto',
                marginBottom: 'auto'
              },
              'div[role="tooltip"]': {
                display: 'none',
                position: 'absolute',
                right: '0',
                top: "40px",
                backgroundColor: 'rgba(0,0,0,.8)',
                color: 'white',
                borderRadius: '10px',
                padding: '.5rem',
                zIndex: "100"
      
              },
              'button:hover + [role="tooltip"], button:focus + [role="tooltip"]' : {
                display: 'block'
              }
            }}
          >
            <Box 
              m="2"
              className="element-and-tooltip"

            >
              <ModalCloseButton
                aria-describedby="register-modal-close-desc"
                aria-label="close modal"
                role="close modal"
              />
              <Box role="tooltip" id="register-modal-close-desc">
                Close
              </Box>
            </Box>
            <ModalHeader>
              <Heading as="h4" size="md">{modalData ? modalData.roomname : "Registration Form"}</Heading>              
            </ModalHeader>
            <ModalBody>
              <Input type="hidden" value={modalData.reserveformid} ref={regFormIdRef}/>
              <Input type="hidden" value={modalData.roomname} ref={regFormRoomNameRef}/>
              <Input type="hidden" value={modalData.roomid} ref={regFormRoomIdRef}/>
              <Text
                mb={3}
              >
                <Text as="span" fontWeight="700">*</Text> = required
              </Text>
              <Box
                sx={{
                  '#root__description': {
                    marginBottom: '1.75rem'
                  },
                  'label span': {
                    marginLeft: '1rem'
                  },
                  'input': {
                    marginBottom: '1rem'
                  },
                  'label': {
                    fontWeight: '900'
                  },
                  '& button': {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                    color: 'white',
                    marginTop: '0.75rem'

                  },
                  '& button:hover': {
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor,
                    color: 'white'
                  }
                }}
              >
                <FormLabel htmlFor="formDate">* Date:</FormLabel>
                <Input
                  type="date"
                  id="formDate"
                  ref={regFormDateRef}
                />
                <FormLabel htmlFor="formTimeFrom">* From:</FormLabel>
                <Input
                  type="time"
                  id="formTimeFrom"
                  ref={regFormTimeFromRef}
                />
                <FormLabel htmlFor="formTimeTo">* To:</FormLabel>
                <Input
                  type="time"
                  id="formTimeTo"
                  ref={regFormTimeToRef}
                />
                <Box className="json-schema-form">
                  <JSONSchemaForm 
                    uiSchema={modalData.reserveform ? JSON.parse(JSON.parse(modalData.reserveform).form_ui_schema) :{"ui:title": " "}}
                    schema={
                      modalData?.reserveform ? JSON.parse(JSON.parse(modalData.reserveform).form_schema) : {}
                    } 
                    onSubmit={e=>submitRegForm(e)}
                    autoComplete="on"
                    validator={validator}
                  />
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Flex 
                justifyContent="center"
                width="100%"
              >
                <Text
                  color="#ee0000"
                  fontWeight="bold"
                >
                {regFormErrorMsg ? regFormErrorMsg : ""}
                </Text>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  )
}