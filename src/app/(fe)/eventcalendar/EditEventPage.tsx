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
  TagCloseButton,
  useToast
} from "@chakra-ui/react";
import {AiOutlineArrowLeft} from 'react-icons/ai';
import { postCreateEvent } from '@/app/actions/eventcalendar/eventcalendar.actions';
import { EditEventPageFormDataType, EquipmentType, EventFormType, EventRoomType, EventTypeType } from '@/app/types/types';

type EditEventPageProps = {
  formData: EditEventPageFormDataType,
  setFormData: React.Dispatch<React.SetStateAction<EditEventPageFormDataType>>,
  eventRooms: EventRoomType[],
  eventTypes: EventTypeType[],
  eventEquipment: EquipmentType[],
  regForms: EventFormType[],
  formErrorMsg: string,
  fetchEvents: ()=>Promise<void>,
  setFormErrorMsg: React.Dispatch<React.SetStateAction<string>>,
  setPageIsEditableForEvent: React.Dispatch<React.SetStateAction<boolean>>
}

const EditEventPage = (props: EditEventPageProps) => {
  const {formData,setFormData,eventRooms,eventTypes,eventEquipment,regForms,formErrorMsg,fetchEvents,setFormErrorMsg,setPageIsEditableForEvent} = props;
  const toast = useToast();
  const tagInputRef = useRef();

  useEffect(()=>{
    return setFormErrorMsg("")
  },[])

  async function createEvent(eventPageFormData: FormData) {
    try {
      await postCreateEvent(eventPageFormData)
        .then(async (response)=>{
          if (response.success) {
            await fetchEvents();
            setPageIsEditableForEvent(false);
          }
          else {
            setFormErrorMsg("")
            setFormErrorMsg(response.message)
          }
        })
    } 
    catch(error) {
      console.error(error);
    }
  }

  const [attendees,setAttendees] = useState(regForms.filter((regForm)=>regForm.id===formData.registrationForm)[0]?.attendees);
  const [waitingList,setWaitingList] = useState(regForms.filter((regForm)=>regForm.id===formData.registrationForm)[0]?.waitinglist);
  const [showAttendeesBox,setShowAttendeesBox] = useState(false);
  const handleRegFormChange = (e: any) => {
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

  function handleDeleteEquipment(e: any) {
    e.preventDefault()
    const {id} = e.target.dataset
    setFormData({...formData, equipment_ids: formData.equipment_ids.filter((fid,i,self)=> i !== self.indexOf(id))})
    // setFormData({...formData, equipment_ids: formData.equipment_ids.filter((fid)=>fid !== id)})
    // setFormData({...formData, equipment_ids: [...formData.equipment_ids, e.target.value]})
  }

  const [displayDisplay, setDisplayDisplay] = useState(!formData.eventHidden);
  function handleHiddenCheckbox(e: any) {
    if (e.target.checked) {
      setDisplayDisplay(false)
    }
    else if (!e.target.checked) {
      setDisplayDisplay(true)
    }
  }

  function handleDeleteTag(e: any) {
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
        <Flex w="100%" justify="space-between">
          <Heading as="h1" size="lg" ms={3}>Add Event</Heading>
          <Button 
            color="grey" 
            me={5}
            fontSize="md" 
            bgColor="transparent"
            p={0}
            h="1.75rem"
            mt={2}
            onClick={e=>setPageIsEditableForEvent(false)}
          >
            <AiOutlineArrowLeft/> Event Calendar
          </Button>
        </Flex>
      </Box>
      <Flex pt={3} w="100%" alignItems="center" justifyContent="center" position="relative">
        <Box 
          w={["100%","100%","75%"]} 
          p={5} 
          border="1px solid" 
          borderColor="inherit" 
          rounded="md"
          boxShadow="lg"
        >
          <form action={createEvent}>
            <FormControl>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-name" fontWeight="700">Event Name:</FormLabel>
                <Input 
                  id="event-name"
                  type="text" 
                  defaultValue={formData && formData.eventName ? formData.eventName : ""}
                  name="eventName"
                  autoComplete="off"
                />
              </Box>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-room-dropdown-menu" fontWeight="700">Room: </FormLabel>
                <Select 
                  id="event-room-dropdown-menu" 
                  defaultValue={formData && formData.roomId ? formData.roomId : ""} 
                  name="roomId"
                >
                  <option value="">Select One</option>
                  {eventRooms.length >= 1 && eventRooms.map((room: EventRoomType)=>{
                    return (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    )
                  })}
                </Select>
              </Box>
              <Box w="100%" mb={2}>
                <Flex alignItems="center" gap={2}>
                  <input 
                    id="show-room" 
                    type="checkbox" 
                    name="showRoom"
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
                  <Input 
                    id="event-date" 
                    type="date" 
                    name="reserveDate"
                    value={formData && formData.reserveDate ? formData.reserveDate : ""} 
                    onChange={e=>{setFormData({...formData, reserveDate: e.target.value})}}
                  />
                </Box>
                <Flex mb={2} alignItems="center" gap={2} justifyContent="space-between">
                  <Box w="50%">
                    <FormLabel htmlFor="reserve-start" fontWeight="700">Reserve start:</FormLabel>
                    <Input 
                      id="reserve-start" 
                      type="time" 
                      value={formData && formData.reserveStart ? formData.reserveStart : ""} 
                      name="reserveStart"
                      onChange={e=>{
                        setFormData({...formData, reserveStart: e.target.value})
                      }}
                    />
                  </Box>
                  <Box w="50%">
                    <FormLabel htmlFor="reserve-end" fontWeight="700">Reserve end:</FormLabel>
                    <Input 
                      id="reserve-end" 
                      type="time" 
                      value={formData && formData.reserveEnd ? formData.reserveEnd : ""} 
                      name="reserveEnd"
                      onChange={e=>{setFormData({...formData, reserveEnd: e.target.value})}}
                    />
                  </Box>
                </Flex>
                <Flex mb={2} alignItems="center" gap={2} justifyContent="space-between">
                  <Box w="50%">
                    <FormLabel htmlFor="event-start" fontWeight="700">Event start:</FormLabel>
                    <Input 
                      id="event-start" 
                      type="time" 
                      value={formData && formData.eventStart ? formData.eventStart : ""} 
                      name="eventStart"
                      onChange={e=>{setFormData({...formData, eventStart: e.target.value})}}
                    />
                  </Box>
                  <Box w="50%">
                    <FormLabel htmlFor="event-end" fontWeight="700">Event end:</FormLabel> 
                    <Input 
                      id="event-end" 
                      type="time" 
                      value={formData && formData.eventEnd ? formData.eventEnd : ""}
                      name="eventEnd" 
                      onChange={e=>{setFormData({...formData, eventEnd: e.target.value})}}
                    />
                  </Box>
                </Flex>
              </Flex>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="event-type-dropdown-menu" fontWeight="700">Event type: </FormLabel>
                <Select 
                  id="event-type-dropdown-menu" 
                  defaultValue={formData && formData.typeId ? formData.typeId : ""} 
                  name="typeId"
                  onChange={e=>{setFormData({...formData, typeId: Number(e.target.value)})}}
                >
                  <option>None</option>
                  {eventTypes.length >= 1 && eventTypes.map((type,i)=>{
                    return (
                      <option key={type.id} style={{color: type.color.rgb}} value={type.id}>{type.name}</option>
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
                <Textarea as={JoditEditor}
                  id="event-description"
                  value={formData && formData.eventDescription ? formData.eventDescription : ""}
                  name="eventDescription"
                  config={config}
                />
              </Box>
              <Box w="100%" mb={2}>
                <FormLabel htmlFor="registration-form-dropdown-menu" fontWeight="700">Registration form: </FormLabel>
                <Select 
                  id="registration-form-dropdown-menu" 
                  defaultValue={formData && formData.registrationForm ? formData.registrationForm : ""} 
                  name="registrationForm"
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
                      name="regFormAttendees"
                    />
                  </Box>
                  <Box w="100%" mb={2}>
                    <FormLabel htmlFor="waitinglist-input" fontWeight="700">Waiting List</FormLabel>
                    <Input 
                      id="waitinglist-input" 
                      defaultValue={waitingList !== null ? waitingList : 0} 
                      min="0"
                      type="number" 
                      name="regFormWaitingList"
                    />
                  </Box>
                </>
              ): null}
              
              <Box w="100%" mb={2}>
                <Flex alignItems="center" gap={2}>
                  <input 
                    id="hidden-event" 
                    type="checkbox"
                    name="eventHidden"
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
                  <Input 
                    id="display-start" 
                    type="datetime-local" 
                    value={formData && formData.displayStart ? formData.displayStart : ""} 
                    name="displayStart"
                    onChange={e=>{setFormData({...formData, displayStart: e.target.value})}}
                  />
                </Box>
                <Box w="50%">
                  <FormLabel htmlFor="display-end" fontWeight="700">Display end:</FormLabel>
                  <Input 
                  id="display-end" 
                  type="datetime-local" 
                  value={formData && formData.displayEnd ? formData.displayEnd : ""} 
                  name="displayEnd"
                  onChange={e=>{
                    setFormData({...formData, displayEnd: e.target.value})
                    }}
                  />
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
                        ref={tagInputRef as any}
                      />
                      <Input type="hidden" name="tags" value={formData.tags}/>
                      <Button 
                        colorScheme="black"
                        variant="outline"
                        w="auto"
                        onClick={e=>{
                          setFormData({...formData, tags: [...formData.tags, (tagInputRef.current as any).value]});
                          (tagInputRef.current as any).value = "";
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
                    <Input type="hidden" name="equipmentIds" value={formData.equipment_ids} />
                    <Select 
                      id="equipment-list-dropdown-menu" 
                      h="2.5rem"
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
                          <option key={equipment.id} data-name={equipment.name} value={equipment.id}>
                            {equipment.name}
                          </option>
                        )
                      })}
                    </Select>
                  </Flex>
                  <Flex maxW={"100%"} gap={1} flexWrap="wrap" alignItems="center">
                    {formData && formData.equipment_ids?.length > 0 ? (formData.equipment_ids.map((eid,i)=> (
                      formData.equipment_ids.length > 0 && 
                      eventEquipment.find((eq)=>eq.id.toString() === eid)?.name !== undefined ? (
                          <Badge 
                            key={i}
                            px={2}
                            py={1}
                            rounded="md"
                          >
                          {eventEquipment.find((eq)=>eq.id.toString() === eid)?.name} 
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
                  name="notes"
                  defaultValue={formData && formData.notes ? formData.notes : ""}
                />
              </Box>
            </FormControl>
            <Flex flexDirection="column" alignItems="center" justifyContent="flex-end">
              <Text color="red" mt={3}>
                {formErrorMsg ? formErrorMsg : ""}
              </Text>
              <Flex mt={3} w="100%">
                <Input type="hidden" name="transId" value={formData.transId?.toString()}/>
                <Button 
                  type="submit" 
                  colorScheme="green" 
                  w="100%"
                  data-transid={formData && formData.transId ? formData.transId : null}
                  onClick={e=>{createEvent(e as any)}}
                >
                  Submit
                </Button>
              </Flex>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Flex>
  )
}

export default EditEventPage;