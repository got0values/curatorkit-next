'use client'

import React, {useState, useEffect, useCallback} from 'react';
import ViewModal from './Modals/ViewModal';
import { 
  Flex,
  Box,
  Button,
  Heading,
  Link,
  Drawer,
  DrawerOverlay,
  FormLabel,
  Select,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  TabList,
  Tab,
  Tabs,
  Text,
  Modal,
  Spinner,
  IconButton,
  useToast
} from "@chakra-ui/react";
import {MdAdd} from 'react-icons/md';
import showAdminDrawer from '../../utils/showAdminDrawer';
import EditEventPage from'./EditEventPage';
import {FaChevronLeft} from 'react-icons/fa';
import EventCalendarDrawers from './EventCalendarDrawers';
import Calendar from 'react-calendar';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {BiLinkExternal} from 'react-icons/bi';
import 'react-calendar/dist/Calendar.css';
import { getEvents, getBigCalData, deleteEvent } from '@/app/actions/eventcalendar/eventcalendar.actions';
import { GetEventsReturnType, EventType, EventRoomType, EventFormType, EditEventPageFormDataType, EquipmentType, EventTypeType, EventsTwoType } from '@/app/types/types';

const EventCalendar = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawer,setShowDrawer] = useState(false);
  const [calEventRoomId,setCalEventRoomId] = useState("All");
  const [events, setEvents] = useState<EventType[] | []>([]);
  const [eventsTwo,setEventsTwo] = useState<EventsTwoType[] | undefined>();
  const [eventsCount,setEventsCount] = useState(0);
  const [dateHeading,setDateHeading] = useState(new Date().toDateString());
  const [regForms,setRegForms] = useState<EventFormType[] | []>([])
  const [pageIsEditableForEvent,setPageIsEditableForEvent] = useState(false);
  const [modalIsViewEvent, setModalIsViewEvent] = useState(false);
  const [formErrorMsg,setFormErrorMsg] = useState("")
  const [modalData, setModalData] = useState<EventType>();
  const [roomFormErrorMsg,setRoomFormErrorMsg] = useState("")
  const [inputDate, setInputDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [eventTypes,setEventTypes] = useState<EventTypeType[] | []>([]);
  const [eventEquipment,setEventEquipment] = useState<EquipmentType[] | []>([]);
  const [subdomain,setSubdomain] = useState<string | undefined>();
  const [eventRooms,setEventRooms] = useState<EventRoomType[] | []>([]);
  const [bigCalendarView,setBigCalendarView] = useState(true)
  const [formData,setFormData] = useState<EditEventPageFormDataType>({
    eventName: null,
    roomId: null,
    typeId: null,
    reserveDate: null,
    reserveStart: null,
    reserveEnd: null,
    eventStart: null,
    eventEnd: null,
    notes: null,
    eventDescription: null,
    eventHidden: false,
    transId: null,
    registrationForm: null,
    displayStart: null,
    displayEnd: null,
    equipment_ids: [],
    tags: [],
    showRoom: null
  })

  function handleDate(e: any) {
    setInputDate(e.toISOString().split("T")[0])
    setDateHeading(e.toDateString())
  }

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    await getEvents(inputDate,calEventRoomId)
      .then((response) => {
        let responseData: GetEventsReturnType = response.data;
        setRegForms(responseData.eventforms)
        setEventTypes(responseData.eventtypes)
        setEvents(responseData.events);
        setEventRooms(responseData.eventrooms)
        setEventEquipment(responseData.equipment)
        setSubdomain(responseData.subdomain)
        setEventsTwo(responseData.eventsTwo);
        setEventsCount(responseData.eventscount)
        setIsLoading(false)
      })
      .catch((error)=>{
        toast({
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
        setIsLoading(false)
      })
  },[inputDate,calEventRoomId])
  useEffect(()=>{
    fetchEvents()
  },[fetchEvents])

  function modalOpenForEvent(e: any) {
    setModalData(events.filter((event)=>event.transid.toString() === e.currentTarget.dataset.transid)[0])
    setModalIsViewEvent(true)
  }

  async function modalOpenForEventTwo(e: any) {
    try {
      await getBigCalData(e["id"])
      .then((response) => {
        setModalData(response.data)
        setModalIsViewEvent(true)
      })
    } 
    catch(error) {
      console.error(error);
    }
  }

  function handleEditClick() {
    if (modalData) {
      setFormData({
        transId: modalData.transid,
        eventName: modalData.event,
        roomId: modalData.roomid,
        typeId: modalData.typeid,
        reserveDate: new Date(modalData.reservedate).toLocaleDateString('fr-CA'),
        reserveStart: new Date(modalData.reservestart).toTimeString().split(" ")[0],
        reserveEnd: new Date(modalData.reserveend).toTimeString().split(" ")[0],
        eventStart: new Date(modalData.eventstart).toTimeString().split(" ")[0],
        eventEnd: new Date(modalData.eventend).toTimeString().split(" ")[0],
        eventDescription: modalData.description,
        notes: modalData.notes,
        eventHidden: modalData.eventhidden,
        registrationForm: modalData.formid,
        displayStart: modalData.displaystart ? new Date(modalData.displaystart).toLocaleDateString('fr-CA') + " " + new Date(modalData.displaystart).toTimeString().split(" ")[0] : "",
        displayEnd: modalData.displayend ? new Date(modalData.displayend).toLocaleDateString('fr-CA') + " " + new Date(modalData.displayend).toTimeString().split(" ")[0] : "",
        equipment_ids: modalData.equipment_ids?.length ? modalData.equipment_ids : [],
        tags: modalData.tags?.length > 0 ? modalData.tags : [],
        showRoom: modalData.showroom,
      })
      setModalIsViewEvent(false);
      setPageIsEditableForEvent(true)
    }
  }

  function handleDuplicateEventClick(e: any) {
    const duplicateEventData = JSON.parse(e.target.dataset.duplicateeventdata)
    setFormData({
      eventName: duplicateEventData.event,
      roomId: duplicateEventData.roomid,
      typeId: duplicateEventData.typeid,
      reserveDate: new Date(duplicateEventData.reservedate).toLocaleDateString('fr-CA'),
      reserveStart: new Date(duplicateEventData.reservestart).toTimeString().split(" ")[0],
      reserveEnd: new Date(duplicateEventData.reserveend).toTimeString().split(" ")[0],
      eventStart: new Date(duplicateEventData.eventstart).toTimeString().split(" ")[0],
      eventEnd: new Date(duplicateEventData.eventend).toTimeString().split(" ")[0],
      eventDescription: duplicateEventData.description,
      notes: duplicateEventData.notes,
      eventHidden: duplicateEventData.eventhidden,
      transId: duplicateEventData.transid,
      registrationForm: duplicateEventData.formid,
      displayStart: duplicateEventData.displaystart ? new Date(duplicateEventData.displaystart).toLocaleDateString('fr-CA') + " " + new Date(duplicateEventData.displaystart).toTimeString().split(" ")[0] : "",
      displayEnd: duplicateEventData.displayend ? new Date(duplicateEventData.displayend).toLocaleDateString('fr-CA') + " " + new Date(duplicateEventData.displayend).toTimeString().split(" ")[0] : "",
      equipment_ids: duplicateEventData.equipment_ids?.length ? duplicateEventData.equipment_ids : [],
      tags: duplicateEventData.tags?.length > 0 ? duplicateEventData.tags : [],
      showRoom: duplicateEventData.showroom
    })
      
    setModalIsViewEvent(false)
    setPageIsEditableForEvent(true)
  }

  function handleAddEventClick() {
    setFormData({
      eventName: null,
      roomId: null,
      typeId: null,
      reserveDate: null,
      reserveStart: null,
      reserveEnd: null,
      eventStart: null,
      eventEnd: null,
      notes: null,
      eventDescription: null,
      eventHidden: false,
      transId: null,
      registrationForm: null,
      displayStart: null,
      displayEnd: null,
      equipment_ids: [],
      tags: [],
      showRoom: false
    });
    setPageIsEditableForEvent(true);
  }

  async function removeEvent(e: any) {
    e.preventDefault();
    if (window.confirm("Are you sure you would like to delete this event?")) {
      try {
        await deleteEvent(e.target.dataset.eventid)
          .then((response)=>{
            if (response.success) {
              closeModal();
              fetchEvents();
              // setEventRooms(events.eventrooms)
            }
          })
      } 
      catch(error) {
        console.log(error);
      }
    }
  }

  function closeModal() {
    setModalIsViewEvent(false);
    setFormErrorMsg("")
    setRoomFormErrorMsg("")
    setFormData({
      eventName: null,
      roomId: null,
      typeId: null,
      reserveDate: null,
      reserveStart: null,
      reserveEnd: null,
      eventStart: null,
      eventEnd: null,
      notes: null,
      eventDescription: null,
      eventHidden: false,
      transId: null,
      registrationForm: null,
      displayStart: null,
      displayEnd: null,
      equipment_ids: [],
      tags: [],
      showRoom: false
    })
    fetchEvents()
  }

  const SmallCalendarView = () => {
    return (
      <>
        <Flex direction={["column","column","row"]} gap={2} alignItems="flex-start">
          <Flex 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            mb={3}
            w={["-webkit-fill-available","-webkit-fill-available","auto"]}
          >
            <Box
              as={Calendar} 
              rounded="sm"
              boxShadow="md"
              borderColor="inherit"
              backgroundColor="transparent"
              calendarType='iso8601' 
              onClickDay={(e: any) => handleDate(e)}
            />
            
          </Flex> 
          <Flex w="100%" flexDirection="column" alignItems="center" justifyContent="center">
            <Flex w="100%" alignItems="center" justifyContent="center">
              <Flex flex="0 0 33%" textAlign="center" alignItems="center">
                <FormLabel me={1} mb={0} htmlFor="event-room-dropdown-menu">Room: </FormLabel> 
                <Select size="sm" w="auto" rounded="md" onChange={e=>setCalEventRoomId(e.target.value)} id="event-room-dropdown-menu">
                    <option value="All">All</option>
                    {eventRooms?.length >= 1 && eventRooms.map((room,i)=>{
                      return (
                        <option key={i} value={room.id}>{room.name}</option>
                      )
                    })}
                </Select>
              </Flex>
              <Flex flex="0 0 33%" alignItems="center" justifyContent="center">
                <Heading as="h4" size="md" textAlign="center" mb={3} mt={3}>{dateHeading ? dateHeading : ""}</Heading>
              </Flex>
              <Flex flex="0 0 33%">
              </Flex>
            </Flex>
            {isLoading ? (
              <Flex justifyContent="center">
                <Spinner size="xl" />
              </Flex>
            ) : (
            <Flex overflow="auto" w="100%">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Room</Th>
                    <Th>Event</Th>
                    <Th>Reserve Start</Th>
                    <Th>Reserve End</Th>
                    <Th>Event Start</Th>
                    <Th>Event End</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {events?.length > 0 && events.map((event, i)=>{
                    return (
                      <Tr 
                        key={event.transid} 
                        className="pointer"
                        data-transid={event.transid}
                        onClick={e=>modalOpenForEvent(e)}
                        _hover={{
                          bgColor: "#efefef",
                          cursor: "pointer"
                        }}
                      >
                        <Td>{event.room?.name}</Td>
                        <Td>{event.event}</Td>
                        <Td>{moment(event.reservestart).format('h:mm A')}</Td>
                        <Td>{moment(event.reserveend).format('h:mm A')}</Td>
                        <Td>{moment(event.eventstart).format('h:mm A')}</Td>
                        <Td>{moment(event.eventend).format('h:mm A')}</Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Flex>
          )}
          </Flex>
        </Flex>
      </>
    )
  }

  const localizer = momentLocalizer(moment)

  return (
    <Box 
      id="main"
    >
      <Drawer 
        isOpen={showDrawer} 
        onClose={()=>setShowDrawer(false)} 
        // scroll="true"
        placement="end" 
      >
        <DrawerOverlay/>
        <EventCalendarDrawers
          eventRooms={eventRooms} 
          setRoomFormErrorMsg={setRoomFormErrorMsg}
          roomFormErrorMsg={roomFormErrorMsg}
          fetchEvents={fetchEvents}
          eventTypes={eventTypes} 
          eventEquipment={eventEquipment} 
        />
      </Drawer>
      <IconButton 
        aria-label="admin drawer"
        colorScheme="black"
        variant="outline"
        position="fixed"
        top="7vh"
        right={0}
        ps={0}
        pe={0}
        minW={0}
        w={5}
        style={{display: `${showDrawer ? "none" : "block"}`}}
        onClick={e=>showAdminDrawer(setShowDrawer)}
        zIndex={10}
        icon={<FaChevronLeft/>}
      />
      {!pageIsEditableForEvent ? (
      <>
        <Box 
          mt={4} 
          mb={5}
          pb={3}
          w="100%"
          position="relative"
        >
          <Box id="vr"></Box>
          <Flex w="100%" alignItems="center" justifyContent="space-between">
            <Flex me={5} gap={2} alignItems="center">
              <Heading as="h1" size="lg">Event Calendar</Heading>
              <Link 
                href={`https://${subdomain}.curatorkit.com/cal`} 
                target="_blank" 
                rel="noreferrer"
              >
                <Button
                  bgColor="transparent"
                  fontSize="lg"
                  title={`https://${subdomain}.curatorkit.com/cal`}
                  p={0}
                >
                  <BiLinkExternal/>
                </Button>
              </Link>
            </Flex>
            <Button 
              size="md"
              me={5}
              color="black"
              borderColor="inherit"
              onClick={e=>handleAddEventClick()}
            >
              <MdAdd/>Add Event
            </Button>
          </Flex>
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            <Tab 
              onClick={e=>setBigCalendarView(true)}>
              Big Calendar
            </Tab>
            <Tab 
              onClick={e=>setBigCalendarView(false)}>
              Daily View
            </Tab>
          </TabList>
        </Tabs>
        <Box
          borderLeft='1px'
          borderRight='1px'
          borderBottom='1px'
          borderColor='inherit'
          minH='82vh'
          height='82vh'
          maxHeight='82vh'
          padding='1rem'
          overflow='auto'
        >
          {bigCalendarView === false ? (
          <SmallCalendarView/>
          ) : (
          <>
            {isLoading ? (
              <div className="d-flex justify-content-center">
                <Spinner size="xl" />
              </div>
            ) : (
              <Box 
                as={BigCalendar}
                localizer={localizer}
                events={eventsTwo}
                // startAccessor="start"
                // endAccessor="end"
                onSelectEvent={(e: any)=>modalOpenForEventTwo(e)}
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
            )}
          </>
          )}
        </Box>
        <Box 
          position="fixed"
          bottom={0}
          right={0}
          me={5}
          mb={2}
          textAlign="right"
        >
          <Text as="i">{eventsCount}</Text> out of 1000 events <Text as="i">({1000 - eventsCount} left)</Text>
        </Box>
      </>
      ) : (
      <Flex justifyContent="center" w="100%" pb={5}>
        <EditEventPage
          formData={formData} 
          setFormData={setFormData} 
          eventRooms={eventRooms} 
          eventTypes={eventTypes} 
          eventEquipment={eventEquipment}
          regForms={regForms} 
          formErrorMsg={formErrorMsg} 
          fetchEvents={fetchEvents}
          setFormErrorMsg={setFormErrorMsg}
          setPageIsEditableForEvent={setPageIsEditableForEvent}
        />
      </Flex>
      )}
      <Modal isOpen={modalIsViewEvent} size="lg" onClose={closeModal} isCentered>
        <ViewModal 
          modalData={modalData!} 
          // regFormDataNullOrIdCount={regFormDataNullOrIdCount} 
          handleEditClick={handleEditClick} 
          deleteEvent={removeEvent}
          handleDuplicateEventClick={handleDuplicateEventClick}
          eventEquipment={eventEquipment}
        />
      </Modal>

    </Box>
  )
}

export default EventCalendar;