'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import moment from 'moment';
import JSONSchemaForm from "@rjsf/core";
import 'react-calendar/dist/Calendar.css';
import JoditEditor from "jodit-react";
import {AiOutlineArrowLeft} from 'react-icons/ai';
import ICalendarLink from "react-icalendar-link";
import {BsApple} from 'react-icons/bs';
import {FcGoogle} from 'react-icons/fc';
import { Accessibility, IAccessibilityOptions } from 'accessibility';
import {CgChevronUpO} from 'react-icons/cg';
import { useCustomTheme } from '@/app/hooks/useCustomTheme';
import { 
  Box, 
  Flex,
  Button, 
  Badge,
  Container, 
  Heading,
  Link,
  Icon,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  Spinner,
  useToast,
  Textarea
} from "@chakra-ui/react"
import DOMPurify from 'dompurify';
import validator from '@rjsf/validator-ajv8';
import { getLibraryNameFromSubdomain } from '@/app/actions/libray.actions';
import { getFeBigCalData, getFeForm, postRegForm, postEmailReminder } from '@/app/actions/frontendcalendar/frontendcalendar.actions';
import { EventDataType, SetFormType } from '@/app/types/types';
import { stringify } from 'flatted';
import '../../../css/form-bs.css';


export default function FrontEndEvent({params}: {params: {slug: string}}) {
  const toast = useToast();
  const [libraryName,setLibraryName] = useState();
  let eventid = params.slug;
  
  const accessibilityOptions: IAccessibilityOptions = {
    icon: {
      // circular: true,
      img: 'accessibility',
      // position: {
      //   bottom: {
      //     size: 15,
      //     units: '%'
      //   },
      //   right: {
      //     size: .75,
      //     units: '%'
      //   }
      // }
    },
    // hotkeys: {
    //   enable: true
    // },
    session: {
      persistent: false
    },
    language: {
      textToSpeechLang: 'en-US',
      speechToTextLang: 'en-US'
    },
    iframeModals: [{
        iframeUrl: 'https://curatorkit.com/event-calendar-info',
        buttonText: 'Event Calendar info',
        icon: 'info'
      }]
  }

  const {primaryColor,secondaryColor} = useCustomTheme();
  const [isLoading,setIsLoading] = useState(false);

  const [event,setEvent] = useState<EventDataType | null>(null);
  const [eventFound,setEventFound] = useState(true);
  const [libraryTimezone,setLibraryTimezone] = useState()
  const fetchEvent = useCallback(async () => {
    const subdomain = window.location.host.split(".")[0];
    setIsLoading(true);
    await getFeBigCalData(subdomain,eventid)
      .then((response) => {
        if (response.success) {
          setLibraryTimezone(response.data.libraryTimezone)
          setEvent(response.data)
          setIsLoading(false)
          topFunction();
          setIsLoading(false)
          setEventFound(true)
        }
        else {
          setEventFound(false)
          toast({
            description: response.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
  },[])

  async function getLibraryName() {
    const subdomain = window.location.host.split(".")[0];
    await getLibraryNameFromSubdomain(subdomain)
      .then((res)=>{
        if (res.success) {
          setLibraryName(res.data)
        }
      })
  }

  useEffect(()=>{
    getLibraryName();
    new Accessibility(accessibilityOptions);
    fetchEvent()
  },[])

  //display scrolltotopbutton
  let scrollToTopButton = document.getElementById("scrollToTopButton");
  window.onscroll = (function() {
    if (scrollToTopButton) {
      if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
        scrollToTopButton.style.display = "inline-block";
      }
      else {
        scrollToTopButton.style.display = "none";
      }
    }
  })

  function topFunction() {
    document.getElementById("chakra-skip-nav")?.focus();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  const [form,setForm] = useState<SetFormType | null>(null);
  const [openFormModal,setOpenFormModal] = useState(false)
  const openRegForm = useCallback(async (e: any) => {
    const formId = e.target.dataset.formid
    const subdomain = window.location.host.split(".")[0];
    try {
      await getFeForm(subdomain,formId)
        .then((response) => {
          setForm({
            formid: formId, 
            formschema: response.data.form_schema, 
            formuischema: response.data.form_ui_schema ? response.data.form_ui_schema : null,
            formeventtypename: e.target.dataset.eventtypename, 
            formeventtypeid: e.target.dataset.eventtypeid
          });
          setOpenFormModal(true);

          const submitFormButton: HTMLElement | null = document.querySelector('button[type="submit"].btn-info');
          if (submitFormButton) {
            submitFormButton.setAttribute("aria-label","submit");
            if (submitFormButton.parentNode) {
              (submitFormButton.parentNode as HTMLElement).style.display = "flex";
              (submitFormButton.parentNode as HTMLElement).style.justifyContent = "flex-end";
            }
          }
        })
    } catch(error) {
        console.log(error);
    }
  },[])

  const closeFormModal = () => {
    setOpenFormModal(false)
    setRegFormErrorMsg("")
    setForm(null)
  }

  const [regFormErrorMsg,setRegFormErrorMsg] = useState("");
  const regFormIdRef = useRef();
  const regFormTypeNameRef = useRef();
  const regFormTypeIdRef = useRef();
  const submitRegForm = useCallback(async (e: any) => {
    const subdomain = window.location.host.split(".")[0];
    await postRegForm(subdomain, stringify(e),(regFormIdRef.current as any).value, (regFormTypeNameRef.current as any).value, (regFormTypeIdRef.current as any).value)
      .then((response)=>{
        if (response.success) {
          if (response.data === "Register") {
            window.alert("Registered!")
            closeFormModal();
            fetchEvent();
          }
          if (response.data === "Waiting List") {
            window.alert("Added to waiting list")
            closeFormModal();
            fetchEvent();
          }
          else {
            setRegFormErrorMsg(response.data)
          }
        }
        else {
          console.error(response);
          toast({
            description: response.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((res)=>{
        console.error(res)
        toast({
          description: res.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
  },[fetchEvent])

  const [openEmailModal,setOpenEmailModal] = useState(false);
  const [emailReminderEventId,setEmailReminderEventId] = useState(null);
  function emailModalOpen(e: any) {
    setEmailReminderEventId(e.target.dataset.eventid)
    setOpenEmailModal(true)
  }

  const [emailReminderError, setEmailReminderError] = useState("");
  const emailRef = useRef();
  async function setEmailReminder(e: any) {
    e.preventDefault();
    const emailAddress = (emailRef.current as any).value;
    if (emailAddress !== "") {
      await postEmailReminder(emailAddress,e.target.dataset.eventid)
        .then((response)=>{
          if (response.success) {
            window.alert("Email Reminder set")
            closeEmailModal();
            fetchEvent();
          }
          else {
            setEmailReminderError(response.message);
            console.error(response)
          }
        })
        .catch((res)=>{
          setEmailReminderError(res.message)
          console.error(res)
        })
    }
    else {
      setEmailReminderError("Please enter an email address")
      document.getElementById("email")!.focus()
    }
  }
  function closeEmailModal() {
    setEmailReminderEventId(null)
    setEmailReminderError("")
    setOpenEmailModal(false);
  }

  return (
    <>
      {/* <SkipNavLink href="chakra-skip-nav">Skip to event</SkipNavLink> */}
      <Container 
        maxW="1200px" 
        mb={2}
        as="main"
      >
        <Flex 
          className="element-and-tooltip"
          my={4}
        >
          <Link href="/cal">
            <Button
              size="sm"
              color="black"
              backgroundColor={primaryColor?.replace(')', ', 0.2)').replace('rgb', 'rgba')}
              aria-label="back to calendar"
              aria-describedby="backtocal-desc"
              _hover={{
                backgroundColor: "white",
                border: "1px solid black",
                color: "black"
              }}
              _dark={{
                backgroundColor: "grey"
              }}
            >
              <AiOutlineArrowLeft/> Back
              <Text as="span" className="visually-hidden">Back to Calendar</Text>
            </Button>
            {/* <Box role="tooltip" id="backtocal-desc">
              Back to Calendar
            </Box> */}
          </Link>

        </Flex>
        {!isLoading && event ? (
          <Flex
            gap={5}
            flexWrap="wrap"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Flex
              flexDirection="column"
              gap={2}
              w={["100%","100%","30%"]}
              boxShadow="md"
              p={5}
              borderRadius="3px"
              _dark={{
                border: "1px",
                borderColor: "grey"
              }}
            >
              {/* <SkipNavContent/> */}
              <Flex 
                alignItems="center" 
                justifyContent="flex-start" 
                gap={1}
              >
                {event.eventTypeName ? (
                  <Badge 
                    variant="solid"
                    background={event.eventTypeColor ? JSON.parse(event.eventTypeColor).rgb : "gray"}
                    rounded="md"
                  >
                    {event.eventTypeName}
                  </Badge>
                ) : null}
                {event.roomName ? (
                  <Badge 
                    variant="solid"
                    rounded="md"
                  >
                    {event.roomName}
                  </Badge>
                ) : null}
              </Flex>
              <Box>
                <Heading
                  as="h2"
                  size="lg"
                >
                  {event.eventname ? event.eventname : "Event"}
                </Heading>
                <Text 
                  color="gray" 
                  fontSize="md"
                >
                  {event.eventstart ? moment.utc(event.eventstart, "MM-DD-YYYY hh:mm:ss A").local().format('ddd, MMM DD, YYYY') : null}
                </Text>
                <Text 
                  color="gray" 
                  fontSize="md"
                >
                  {event.eventstart ? moment.utc(event.eventstart, "MM-DD-YYYY hh:mm:ss A").local().format('hh:mma') : null} - {event.eventend? moment.utc(event.eventend, "MM-DD-YYYY hh:mm:ss A").local().format('hh:mma') : null}
                </Text>
              </Box>


              <Flex 
                flexDirection="column"
                gap={2}
                alignItems="flex-start"
                justifyContent="space-between"
                width="100%"
              >
                <Flex
                  alignItems="center"
                  gap={1}
                >
                  <Button 
                    border="1px"
                    bg="transparent"
                    size="sm"
                    borderColor={secondaryColor} 
                    color={secondaryColor}
                    data-eventid={event.transid}
                    onClick={e=>emailModalOpen(e)}
                  >
                    Email Reminder
                  </Button>
                  <a target="_blank" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=${libraryTimezone}&location=${libraryName}&dates=${new Date(event.eventstart).toISOString().replace(/[\W_]+/g,"")}/${new Date(event.eventend).toISOString().replace(/[\W_]+/g,"")}&text=${event.eventname}&trp=false`}>
                    <Button
                      variant="outline"
                      size="sm"
                      display="flex"
                      alignItems="center"
                      tabIndex={-1}
                      gap={1}
                    >
                      <Icon as={FcGoogle}/> GCal
                    </Button>
                  </a>
                  <Box as={ICalendarLink}
                    event={{
                      title: event.eventname,
                      description: "",
                      startTime: moment(new Date(event.eventstart)).toISOString(true),
                      endTime: moment(new Date(event.eventend)).toISOString(true),
                      location: libraryName,
                      attendees: []
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      display="flex"
                      alignItems="center"
                      tabIndex={-1}
                      gap={1}
                    >
                      <Icon as={BsApple} mb={1}/>ICal
                    </Button>
                  </Box>
                </Flex>
                <Flex 
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  w="100%"
                >
                  <Box>
                    <Text>
                      {event.attendees - event.numberRegistered > 1 ? (
                      event.attendees - event.numberRegistered + " spots left"
                      ) : event.attendees - event.numberRegistered === 1 ? (
                        "1 spot left"
                      ) : ""}
                    </Text>
                  </Box>
                  <Box w="100%">
                    {event.form_id !== null ? (
                    <Button 
                      backgroundColor={primaryColor}
                      color="white"
                      w="100%"
                      size="sm"
                      data-formid={event.form_id}
                      data-eventtypename={event.eventtype}
                      data-eventtypeid={event.eventtype}
                      onClick={openRegForm}
                      _hover={{
                        backgroundColor: secondaryColor
                      }}
                    >
                      {event.registrationType}
                    </Button>
                    ) : (
                      <Text>
                        {event.registrationType}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Flex>
            </Flex>

            {event?.description ? (
              <Box 
                w={["100%","100%","65%"]}
                mt={0}
                mb={5}
                boxShadow="md"
                p={3}
                sx={{
                  ".jodit-container": {
                      border: "none"
                  },
                  "img": {
                    "margin": ".5rem"
                  }
                }}
              >
                <Textarea as={JoditEditor} 
                  value={DOMPurify.sanitize(event.description)}
                  minH="40px"
                  config={{
                    readonly: true,
                    toolbar: false,
                    tabIndex: 0,
                    // height: 'fit-content',
                    iframe: false,
                    // iframeStyle: 'html{font-family: Questrial,Montserrat,sans-serif}',
                    // iframeDocType: "iframe",
                    statusbar: false
                  }}
                />
              </Box>
            ): null}
          </Flex>
        ) : (
          !eventFound ? (
            <Flex justifyContent="center">
              <Heading
                as="h1"
                size="lg"
              >
                Event not found
              </Heading>
            </Flex>
          ) : (
            <Flex w={100} justifyContent="center">
              <Spinner size="xl"/>
            </Flex>
          )
        )}
      </Container>
      {form?.formschema ? (
      <Modal 
        isOpen={openFormModal} 
        onClose={closeFormModal} 
        aria-label={form.formschema ? JSON.parse(form.formschema).title : "Registration Form"}
        isCentered
      >
        <ModalOverlay/>
        <ModalContent
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
            <Heading as="h4" size="md">{form.formschema ? JSON.parse(form.formschema).title : "Registration Form"}</Heading>              
          </ModalHeader>
          <ModalBody>
            <Input type="hidden" value={form.formid} ref={regFormIdRef as any}/>
            <Input type="hidden" value={form.formeventtypename} ref={regFormTypeNameRef as any}/>
            <Input type="hidden" value={form.formeventtypeid} ref={regFormTypeIdRef as any}/>
            <Text
              mb={3}
            >
              * = required
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
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  color: 'white'
                }
              }}
            >
              <Box className="json-schema-form">
                <JSONSchemaForm 
                  uiSchema={form?.formuischema ? JSON.parse(form.formuischema) : {"ui:title": " "}}
                  validator={validator}
                  schema={form ? JSON.parse(form.formschema) : {}} 
                  onSubmit={e=>submitRegForm(e)}
                  autoComplete="on"
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
      ) : ""}

      <Modal 
        size="lg"
        isOpen={openEmailModal} 
        onClose={closeEmailModal}
        aria-label="Email reminder modal"
        isCentered
      >
        <ModalOverlay/>
        <ModalContent
          sx={{
            '.element-and-tooltip': {
              marginTop: 'auto',
              marginBottom: 'auto'
            },
            'div[role="tooltip"]': {
              display: 'none',
              position: 'absolute',
              right: '0',
              backgroundColor: 'rgba(0,0,0,.7)',
              color: 'white',
              fontSize: '1rem',
              borderRadius: '10px',
              padding: '.5rem',
              zIndex: "100"

            },
            'button:hover + [role="tooltip"], button:focus + [role="tooltip"]' : {
              display: 'block'
            }
          }}
        >
          <ModalHeader me="2rem">
            Email Reminder
            <Box 
              m="2"
              className="element-and-tooltip"

            >
              <ModalCloseButton
                aria-describedby="email-modal-close-desc"
                aria-label="close modal"
                role="close modal"
              />
              <Box role="tooltip" id="email-modal-close-desc">
                Close
              </Box>
            </Box>
          </ModalHeader>
          <ModalBody>
            <Box w="100%" mb={2}>
              <Text mb={5} color="#727272">
                You will receive an email the day before the event
              </Text>
              <Input 
                id="email"
                type="email" 
                required
                aria-required="true"
                placeholder="Email (required)"
                _placeholder={{
                  color: "#727272"
                }}
                borderColor="black"
                _hover={{
                  borderColor: "black"
                }}
                _dark={{
                  borderColor: "white"
                }}
                ref={emailRef as any}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Flex 
              alignItems="center"
              justifyContent="flex-end"
              gap={2}
              flex="0 0 auto"
            >
              <Text 
                color="#ee0000"
                role="alert"
                aria-live="assertive"
              >
                {emailReminderError}
              </Text>
              <Button 
                border="1px"
                borderColor={secondaryColor}
                backgroundColor={secondaryColor}
                color={secondaryColor ? "white" : "black"}
                data-eventid={emailReminderEventId}
                onClick={e=>setEmailReminder(e)}
              >
                Submit
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box 
        as="span" 
        position="fixed"
        bottom="5%"
        right="0.75%"
        display="none"
        id="scrollToTopButton"
      >
        <Button 
          color="black"
          p={0}
          height="3.25rem"
          width="3.25rem"
          bgColor="white"
          fontSize="3.25rem"
          tabIndex={0}
          borderRadius="full"
          aria-label="back to top"
          aria-describedby="scroll-to-top-button"
          _hover={{
            color: "black"
          }}
          onClick={()=>{topFunction()}}
          onKeyDown={e=>e.key==='Enter' ? topFunction() : null}
        >
          <CgChevronUpO/>
          <Text as="span" className="visually-hidden">Scroll to top</Text>
        </Button>
        <Box role="tooltip" id="scroll-to-top-desc">Scroll to top</Box>
      </Box>
    </>
  )
}