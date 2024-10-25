'use client'

import {useState,useCallback,useRef, useEffect} from 'react';
import JoditEditor from "jodit-react";
import { 
  Box, 
  Flex,
  Button,  
  Textarea,
  Heading,
  Input,
  Text,
  FormControl,
  FormLabel,
  Link,
  Select,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton
} from "@chakra-ui/react";
import {AiOutlineArrowLeft} from 'react-icons/ai';

const EditEventPage = (props) => {
  const {formData,setFormData,eventRooms,eventTypes,eventEquipment,regForms,formErrorMsg,closeModal,fetchEvents,setFormErrorMsg,setPageIsEditableForEvent} = props;

  const eventNameRef = useRef();
  const formDescriptionRef = useRef()
  const hiddenRef = useRef();
  const roomRef = useRef();
  const notesRef = useRef();
  const regFormAttendeesRef = useRef();
  const regFormWaitingListRef = useRef();
  const tagInputRef = useRef();
  const showRoomRef = useRef();

  useEffect(()=>{
    return setFormErrorMsg(null)
  },[])

  const createEvent = useCallback(async (e) => {
    e.preventDefault();
    try {
        await axios
        .post(server + "/eventcalendar", {
          formdata: {
            trans_id: formData.transId,
            event_name: eventNameRef.current.value,
            room_id: roomRef.current.value,
            reserve_date: formData.reserveDate ? formData.reserveDate : "",
            reserve_start: formData.reserveStart ? formData.reserveDate + " " + formData.reserveStart : "",
            reserve_end: formData.reserveEnd ? formData.reserveDate + " " + formData.reserveEnd : "",
            event_start: formData.eventStart ? formData.reserveDate + " " + formData.eventStart : "",
            event_end: formData.eventEnd ? formData.reserveDate + " " + formData.eventEnd : "",
            type_id: formData.typeId,
            equipment_ids: formData.equipment_ids,
            notes: notesRef.current.value,
            eventhidden: hiddenRef.current.checked,
            description: formDescriptionRef.current.value,
            registration_form: formData.registrationForm ? formData.registrationForm : null,
            display_start: formData.displayStart ? formData.displayStart : null,
            display_end: formData.displayEnd ? formData.displayEnd : null,
            regform_attendees: regFormAttendeesRef.current ? regFormAttendeesRef.current.value : null,
            regform_waiting_list: regFormWaitingListRef.current ? regFormWaitingListRef.current.value : null,
            tags: formData.tags?.length > 0 ? formData.tags : [],
            showroom: showRoomRef.current.checked
          }
        })
        .then((response)=>{
          if (response.data === "OK") {
            hiddenRef.current.checked = false;
            eventNameRef.current.value = "";
            notesRef.current.value = "";
            fetchEvents();
            setPageIsEditableForEvent(false);
          }
          else {
            setFormErrorMsg(null)
            setFormErrorMsg(response.data)
          }
        })
    } catch(error) {
        console.log(error);
    }
  },[server,formData,closeModal,fetchEvents,setFormErrorMsg,setPageIsEditableForEvent])

  const [attendees,setAttendees] = useState(regForms.filter((regForm)=>regForm.id===formData.registrationForm)[0]?.attendees);
  const [waitingList,setWaitingList] = useState(regForms.filter((regForm)=>regForm.id===formData.registrationForm)[0]?.waitinglist);
  const [showAttendeesBox,setShowAttendeesBox] = useState(false);
  const handleRegFormChange = (e) => {
    setFormData({...formData, registrationForm: e.target.value})
    if (e.target.value !== "") {
      setAttendees(regForms.filter((regForm)=>regForm.id.toString()===e.target.value)[0].attendees)
      setWaitingList(regForms.filter((regForm)=>regForm.id.toString()===e.target.value)[0].waitinglist)
      setShowAttendeesBox(true)
    }
    else {
      setAttendees(0)
      setWaitingList(0)
      setShowAttendeesBox(false)
    }
  }

  function handleDeleteEquipment(e) {
    e.preventDefault()
    const {id} = e.target.dataset
    setFormData({...formData, equipment_ids: formData.equipment_ids.filter((fid,i,self)=> i !== self.indexOf(id))})
    // setFormData({...formData, equipment_ids: formData.equipment_ids.filter((fid)=>fid !== id)})
    // setFormData({...formData, equipment_ids: [...formData.equipment_ids, e.target.value]})
  }

  const [displayDisplay, setDisplayDisplay] = useState(!formData.eventHidden);
  function handleHiddenCheckbox(e) {
    if (e.target.checked) {
      setDisplayDisplay(false)
    }
    else if (!e.target.checked) {
      setDisplayDisplay(true)
    }
  }

  function handleDeleteTag(e) {
    const {tagname} = e.target.parentNode.dataset;
    setFormData({...formData, tags: formData.tags.filter((tag,i,self)=> tag !== tagname)})
  }


  const config = {
    hidePoweredByJodit: true,
    minHeight: '400px',
    width: 'auto',
    removeButtons: ['video','about',"fullsize",'file','classSpan'],
    link: {
      noFollowCheckbox: false,
      // openInNewTabCheckbox: false
    },
    useSplitMode: true
    // statusbar: false
  }

  return (
    <Flex 
      direction="column" 
      alignItems="flex-start" 
      mt={3} 
      w="100%" 
    >
      <Box
        position="relative"
        w="100%"
        pb={4}
      >
        <Flex w="100%" color="grey" alignItems="center">
          <Box id="vr"></Box>
        </Flex>
        <Flex w="100%" >
          <Heading as="h1" size="lg">Add Event</Heading>
        </Flex>
      </Box>
      <Flex pt={3} w="100%" alignItems="center" justifyContent="center" position="relative">
        <Button 
          color="grey" 
          ms={1}
          fontSize="md" 
          bgColor="transparent"
          p={0}
          h="1.75rem"
          mt={2}
          onClick={e=>setPageIsEditableForEvent(false)}
          position="absolute"
          top={0}
          left={0}
        >
        <AiOutlineArrowLeft/> Event Calendar
        </Button>
        <Box 
          w={["100%","100%","75%"]} 
          p={5} 
          border="1px solid" 
          borderColor="inherit" 
          rounded="md"
          boxShadow="lg"
        >
          <Box>
            <FormControl>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-name" fontWeight="700">Event Name:</FormLabel>
                <Input 
                  id="event-name"
                  type="text" 
                  defaultValue={formData && formData.eventName ? formData.eventName : ""}
                  ref={eventNameRef}
                  autoComplete="off"
                />
              </Box>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-room-dropdown-menu" fontWeight="700">Room: </FormLabel>
                <Select 
                  id="event-room-dropdown-menu" 
                  defaultValue={formData && formData.roomId ? formData.roomId : ""} 
                  ref={roomRef}
                >
                  <option value="">Select One</option>
                  {eventRooms.length >= 1 && eventRooms.map((room,i)=>{
                    return (
                      <option key={room['id']} value={room['id']}>{room['roomName']}</option>
                    )
                  })}
                </Select>
              </Box>
              <Box w="100%" mb={2}>
                <Flex alignItems="center" gap={2}>
                  <input 
                    id="show-room" 
                    type="checkbox" 
                    ref={showRoomRef}
                    defaultChecked={formData && formData.showRoom === true ? true : false}
                  />
                  <FormLabel 
                    htmlFor="show-room"
                    m={0}
                    fontWeight="700"
                  >
                    Display Room?
                  </FormLabel>
                </Flex>
              </Box>
              <Flex flexDirection="column" mb={2}>
                <Box w={["100%","100%","50%"]} mb={2}>
                  <FormLabel htmlFor="event-date" fontWeight="700">Reserve date:</FormLabel>
                  <Input id="event-date" type="date" value={formData && formData.reserveDate ? formData.reserveDate : ""} onChange={e=>{setFormData({...formData, reserveDate: e.target.value})}}/>
                </Box>
                <Flex mb={2} alignItems="center" gap={2} justifyContent="space-between">
                  <Box w="50%">
                    <FormLabel htmlFor="reserve-start" fontWeight="700">Reserve start:</FormLabel>
                    <Input id="reserve-start" type="time" value={formData && formData.reserveStart ? formData.reserveStart : ""} onChange={e=>{
                      setFormData({...formData, reserveStart: e.target.value})
                      }}/>
                  </Box>
                  <Box w="50%">
                    <FormLabel htmlFor="reserve-end" fontWeight="700">Reserve end:</FormLabel>
                    <Input id="reserve-end" type="time" value={formData && formData.reserveEnd ? formData.reserveEnd : ""} onChange={e=>{setFormData({...formData, reserveEnd: e.target.value})}}/>
                  </Box>
                </Flex>
                <Flex mb={2} alignItems="center" gap={2} justifyContent="space-between">
                  <Box w="50%">
                    <FormLabel htmlFor="event-start" fontWeight="700">Event start:</FormLabel>
                    <Input id="event-start" type="time" value={formData && formData.eventStart ? formData.eventStart : ""} onChange={e=>{setFormData({...formData, eventStart: e.target.value})}}/>
                  </Box>
                  <Box w="50%">
                    <FormLabel htmlFor="event-end" fontWeight="700">Event end:</FormLabel> 
                    <Input id="event-end" type="time" value={formData && formData.eventEnd ? formData.eventEnd : ""} onChange={e=>{setFormData({...formData, eventEnd: e.target.value})}}/>
                  </Box>
                </Flex>
              </Flex>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-type-dropdown-menu" fontWeight="700">Event type: </FormLabel>
                <Select id="event-type-dropdown-menu" defaultValue={formData && formData.typeId ? formData.typeId : ""} onChange={e=>{setFormData({...formData, typeId: e.target.value})}}>
                  <option>None</option>
                  {eventTypes.length >= 1 && eventTypes.map((type,i)=>{
                    return (
                      <option key={type.id} style={{color: type.color.rgb}} value={type.id}>{type.typeName}</option>
                    )
                  })}
                </Select>
              </Box>
              <Box 
                w="100%" 
                mb={2}
                sx={{
                  'button[aria-label="Change mode"]': {
                    display: 'none'
                  }
                }}
              >
                <FormLabel htmlFor="event-description" fontWeight="700">Description</FormLabel> 
                <JoditEditor
                  id="event-description"
                  value={formData && formData.eventDescription ? formData.eventDescription : ""}
                  ref={formDescriptionRef} 
                  config={config}
                />
              </Box>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="registration-form-dropdown-menu" fontWeight="700">Registration form: </FormLabel>
                <Select 
                  id="registration-form-dropdown-menu" 
                  defaultValue={formData && formData.registrationForm ? formData.registrationForm : ""} 
                  onChange={e=>handleRegFormChange(e)}
                >
                  <option value="">Select One</option>
                  {regForms.length >= 1 && regForms.map((form,i)=>{
                    return (
                      <option key={form['id']} value={form['id']}>{form['title']}</option>
                    )
                  })}
                </Select>
              </Box>
                
              {showAttendeesBox || (formData && formData.registrationForm) ? (
                <>
                  <Box w="100%" mb={2}>
                    <FormLabel htmlFor="attendees-input" fontWeight="700">Attendees</FormLabel>
                    <Input 
                      id="attendees-input" 
                      defaultValue={attendees !== null ? attendees : 0} 
                      min="0"
                      type="number" 
                      ref={regFormAttendeesRef}
                    />
                  </Box>
                  <Box w="100%" mb={2}>
                    <FormLabel htmlFor="waitinglist-input" fontWeight="700">Waiting List</FormLabel>
                    <Input 
                      id="waitinglist-input" 
                      defaultValue={waitingList !== null ? waitingList : 0} 
                      min="0"
                      type="number" 
                      ref={regFormWaitingListRef}
                    />
                  </Box>
                </>
              ): null}
              
              <Box w="100%" mb={2}>
                <Flex alignItems="center" gap={2}>
                  <input 
                    id="hidden-event" 
                    type="checkbox" 
                    ref={hiddenRef}
                    defaultChecked={formData && formData.eventHidden === true ? true : false}
                    onChange={e=>handleHiddenCheckbox(e)}
                  />
                  <FormLabel 
                    htmlFor="hidden-event"
                    m={0}
                    fontWeight="700"
                  >
                    Hidden?
                  </FormLabel>
                </Flex>
              </Box>
              <Flex 
                mb={2} 
                alignItems="center" 
                gap={2} 
                justifyContent="space-between" 
                sx={{
                  display: displayDisplay === true ? "flex" : "none"
                }}
              >
                <Box w="50%">
                  <FormLabel htmlFor="display-start" fontWeight="700">Display start:</FormLabel>
                  <Input id="display-start" type="datetime-local" value={formData && formData.displayStart ? formData.displayStart : ""} onChange={e=>{setFormData({...formData, displayStart: e.target.value})}}/>
                </Box>
                <Box w="50%">
                  <FormLabel htmlFor="display-end" fontWeight="700">Display end:</FormLabel>
                  <Input id="display-end" type="datetime-local" value={formData && formData.displayEnd ? formData.displayEnd : ""} onChange={e=>{
                    setFormData({...formData, displayEnd: e.target.value})
                    }}/>
                </Box>
              </Flex>
              <Box w="100%" mb={2}>
                <Flex flexWrap="wrap" alignItems="center" gap={2} id="tags">
                  <Flex flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minW={["100%","100%","30%"]}>
                    <FormLabel htmlFor="add-tag" fontWeight="700">Tags:</FormLabel>
                    <Flex alignItems="center" w="auto" gap={2} flexWrap="wrap">
                      <Input 
                        type="text" 
                        w="auto"
                        id="add-tag"
                        ref={tagInputRef}
                      />
                      <Button 
                        colorScheme="black"
                        variant="outline"
                        w="auto"
                        onClick={e=>{
                          setFormData({...formData, tags: [...formData.tags, tagInputRef.current.value]})
                          tagInputRef.current.value = "";
                        }
                      }
                      >
                        Add
                      </Button>
                    </Flex>
                  </Flex>
                  <Flex ms={3} gap={1} maxW="100%" flexWrap="wrap" alignItems="center" justifyContent="flex-start">
                    {formData?.tags?.length > 0 ? (
                        formData.tags.map((tag,i)=>{
                          return (
                            <Tag 
                              key={i}
                              borderRadius="full"
                              size="md"
                              variant="solid"
                              colorScheme="blackAlpha"
                            >
                              <TagLabel>{tag}</TagLabel>
                              <TagCloseButton
                                data-tagname={tag}
                                color="red"
                                onClick={e=>handleDeleteTag(e)}
                              />
                            </Tag>
                          )
                        })
                      ) : ""}
                  </Flex>
                </Flex>
              </Box>
              <Box w="100%" mb={2}>
                <Flex  flexWrap="wrap" alignItems="flex-end" gap={2} id="equipment">
                  <Flex flexDirection="column" alignItems="flex-start" minW="30%">
                    <FormLabel htmlFor="equipment-list-dropdown-menu" fontWeight="700">Equipment: </FormLabel>
                    <Select 
                      id="equipment-list-dropdown-menu" 
                      h="2.5rem"
                      defaultValue={formData && formData.equipment_ids ? formData.equipment_ids : []}
                      onChange={e=>e.target.value !== "" && formData.equipment_ids ? (
                        setFormData(prev=>(
                          {...prev, equipment_ids: [...prev.equipment_ids, e.target.value]}
                          ))
                        ) : null}
                        multiple={false}
                      sx={{
                        '& option:hover': {
                          bg: "blue",
                          color: "white",
                          cursor: "pointer"
                        }
                      }}
                    >
                      <option value="">None</option>
                      {eventEquipment.length >= 1 && eventEquipment.map((equipment,i)=>{
                        return (
                          <option key={equipment['id']} data-name={equipment['equipmentName']} value={equipment['id']}>
                            {equipment['equipmentName']}
                          </option>
                        )
                      })}
                    </Select>
                  </Flex>
                  <Flex maxW={"100%"} gap={1} flexWrap="wrap" alignItems="center">
                    { formData && formData.equipment_ids?.length > 0 ? (formData.equipment_ids.map((eid,i)=> (
                      formData.equipment_ids.length > 1 && i !== 0 && 
                      eventEquipment.find((eq)=>eq.id.toString() === eid)?.equipmentName !== undefined ? (
                          <Badge 
                            key={i}
                            px={2}
                            py={1}
                            rounded="md"
                          >
                          {eventEquipment.find((eq)=>eq.id.toString() === eid)?.equipmentName} 
                          <Text 
                            as="span" 
                            data-id={eid}
                            onClick={e=>handleDeleteEquipment(e)}
                            fontWeight="bold"
                            ms={1}
                            color="red"
                            style={{cursor: "pointer"}}
                          >
                            x
                          </Text>
                        </Badge> ) : "" ))
                      ) : ""
                    }
                  </Flex>
                </Flex>
              </Box>
              <Box w="100%">
                <FormLabel htmlFor="notes" fontWeight="700">Notes:</FormLabel>
                <Textarea 
                  id="notes"
                  type="text"
                  defaultValue={formData && formData.notes ? formData.notes : ""}
                  ref={notesRef}
                />
              </Box>
            </FormControl>
            <Flex flexDirection="column" alignItems="center" justifyContent="flex-end">
              <Text color="red" mt={3}>
                {formErrorMsg ? formErrorMsg : ""}
              </Text>
              <Flex mt={3} w="100%">
                <Button 
                  type="submit" 
                  colorScheme="green" 
                  w="100%"
                  data-transid={formData && formData.transId ? formData.transId : null}
                  onClick={e=>{createEvent(e)}}
                >
                  Submit
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}

export default EditEventPage;