'use client'

import {useState,useRef} from 'react';
import { 
  Flex,
  Box,
  Button, 
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  Heading,
  Select,
  Input,
  Text
} from "@chakra-ui/react"
import { hexToRgb } from '../../utils/hexToRgb';

const EventCalendarDrawers = (props) => {
  const {fetchEvents,setEventRooms,events,eventRooms,setRoomFormErrorMsg,roomFormErrorMsg,setEventTypes,eventTypes,eventEquipment,closeModal,setEventEquipment} = props;

  const [roomName,setRoomName] = useState();
  const [deleteRoomId,setDeleteRoomId] = useState("Select One");
  async function addRoom(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/eventrooms", {
          roomform: {
              room_name: roomName
          }
      })
      .then((response)=>{
        if (response.data === "OK") {
          setRoomName();
          closeModal();
          fetchEvents();
          setEventRooms(events.eventrooms);
        }
        else {
          setRoomFormErrorMsg(response.data)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  async function deleteRoom(e) {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios
        .delete(server + "/eventrooms", {
            data: {
              room_delete_id: JSON.stringify(e.target.dataset.deleteroomid)
            }
        })
        .then((response)=>{
          if (response.data === "OK") {
            closeModal();
            fetchEvents();
            setEventRooms(events.eventrooms);
          }
          else {
            setRoomFormErrorMsg(response.data)
          }
        })
      } catch(error) {
          console.log(error);
      }
    }
  }

  const [typeName,setTypeName] = useState();
  const eventTypeColorRef = useRef();
  const [typeFormErrorMsg,setTypeFormErrorMsg] = useState();
  const [colorDeleteTypeId,setColorDeleteTypeId] = useState("Select One");
  async function addType(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/eventtypes", {
          typeform: {
              type_name: typeName,
              type_color: {
                hex: eventTypeColorRef.current.value,
                rgb: hexToRgb(eventTypeColorRef.current.value)
              }
          }
      })
      .then((response)=>{
        if (response.data === "OK") {
          setTypeName();
          closeModal();
          fetchEvents();
          setEventTypes(events.eventtypes);
        }
        else {
          setTypeFormErrorMsg(response.data)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  const eventTypeColorEditRef = useRef();
  const typeSelectRef = useRef();
  const [eventTypeColorEdit,setEventTypeColorEdit] = useState(null);
  async function saveTypeColor(e) {
    e.preventDefault();
    if (typeSelectRef.current.selectedIndex !== 0) {
      try {
        await axios
        .put(server + "/typecolor", {
            type_color_id: typeSelectRef.current.options[typeSelectRef.current.selectedIndex].value,
            color: {
              hex: eventTypeColorEditRef.current.value,
              rgb: hexToRgb(eventTypeColorEditRef.current.value)
            }
        })
        .then((response)=>{
          if (response.data === "OK") {
            window.alert("Event type color saved!")
          }
          else {
            setTypeFormErrorMsg(response.data)
          }
        })
      } catch(error) {
          console.log(error);
      }
    }
  }

  async function deleteType(e) {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this event type?")) {
      try {
        await axios
        .delete(server + "/eventtypes", {
            data: {
              type_delete_id: typeSelectRef.current.options[typeSelectRef.current.selectedIndex].value
            }
        })
        .then((response)=>{
          if (response.data === "OK") {
            closeModal();
            fetchEvents();
          }
          else {
            setTypeFormErrorMsg(response.data)
          }
        })
      } catch(error) {
          console.log(error);
      }
    }
  }

  const [equipmentName,setEquipmentName] = useState();
  const [deleteEquipmentId,setDeleteEquipmentId] = useState();
  const [equipmentFormErrorMsg,setEquipmentFormErrorMsg] = useState()
  async function addEquipment(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/eventequipment", {
          equipmentform: {
              equipment_name: equipmentName
          }
      })
      .then((response)=>{
        if (response.data === "OK") {
          setEquipmentName();
          closeModal();
          fetchEvents();
          setEventEquipment(events.equipment);
        }
        else {
          setEquipmentFormErrorMsg(response.data)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  async function deleteEquipment(e) {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await axios
        .delete(server + "/eventequipment", {
            data: {
              equipment_delete_id: JSON.stringify(e.target.dataset.deleteequipmentid)
            }
        })
        .then((response)=>{
          if (response.data === "OK") {
            closeModal();
            fetchEvents();
          }
          else {
            setEquipmentFormErrorMsg(response.data)
          }
        })
      } catch(error) {
          console.log(error);
      }
    }
  }

  return (
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
        <DrawerCloseButton 
          color="black"
          mt={6} 
          mr={3}
          _dark={{
            color: "white"
          }}
        />
        
        <Flex 
          backgroundColor="#f7f7f7"
          color="white"
          rounded="md" 
          p={5} 
          flexDirection="column" 
          alignItems="flex-end" 
          justifyContent="flex-start"
          _dark={{
            backgroundColor: "var(--chakra-colors-gray-800)",
            color: "black"
          }}
        >
          <DrawerHeader alignSelf="flex-start" p="0 0 1rem 0">
            <Heading 
              as="h4" 
              color="black"
              size="md"
              _dark={{
                color: "white"
              }}
            >
              Rooms
            </Heading>
          </DrawerHeader>
          <Flex gap={2} mb={3}>
              <Input 
                size="sm" 
                color="black"
                borderColor="black" 
                placeholder="Room Name" 
                type="text" 
                onChange={e=>setRoomName(e.target.value)}
                _dark={{
                  color: "white"
                }}
              />
              <Button 
                colorScheme="green"
                size="sm"
                type="submit" 
                onClick={e=>{addRoom(e)}}
              >
                Add
              </Button>
          </Flex>
          <Flex justifyContent="center" gap={1} w="100%">
            <Select 
              size="sm" 
              color="black"
              borderColor="black" 
              onChange={e=>{setDeleteRoomId(e.target.value)}}
              _dark={{
                color: "white"
              }}
            >
              <option value="Select One">Select One</option>
              {eventRooms && eventRooms.length >= 1 && eventRooms.map((room,i)=>{
                return (
                  <option key={room['id']} value={room['id']}>{room['roomName']}</option>
                )
              })}
            </Select>
            <Button colorScheme="red" size="sm" data-deleteroomid={deleteRoomId} onClick={e=>deleteRoom(e)}>Delete</Button>
          </Flex>
          <Text color="red" mt={3}>
            {roomFormErrorMsg ? roomFormErrorMsg : ""}
          </Text>
        </Flex>

        <Flex 
          backgroundColor="#f7f7f7"
          color="black"
          rounded="md" 
          p={5} 
          flexDirection="column" 
          alignItems="flex-end" 
          justifyContent="flex-start"
          _dark={{
            backgroundColor: "var(--chakra-colors-gray-800)",
            color: "white"
          }}
        >
          <DrawerHeader alignSelf="flex-start" p="0 0 1rem 0">
            <Heading 
              as="h4" 
              color="black"
              size="md"
              _dark={{
                color: "white"
              }}
            >
              Event Types
            </Heading>
          </DrawerHeader>
          <Flex gap={2} mb={3}>
            <Input type="color" ref={eventTypeColorRef} size="sm" p={0} w={100}/>
            <Input 
              size="sm" 
              color="black"
              borderColor="black" 
              placeholder="Event Type" 
              type="text" 
              onChange={e=>setTypeName(e.target.value)}
              _dark={{
                color: "white"
              }}
            />
            <Button 
              colorScheme="green"
              size="sm"
              type="submit" 
              onClick={e=>{addType(e)}}
            >
              Add
            </Button>
          </Flex>
          <Flex justifyContent="center" gap={1} mb={2} w="100%">
            {eventTypeColorEdit ? (
            <Input 
              type="color" 
              size="sm"
              ref={eventTypeColorEditRef} 
              value={eventTypeColorEdit}
              onChange={e=>setEventTypeColorEdit(e.target.value)}
              p={0} 
              w={100}
            />
            ) : null}
            <Select 
              size="sm" 
              color="black"
              borderColor="black" 
              ref={typeSelectRef}
              onChange={e=>{setEventTypeColorEdit(e.target.options[e.target.selectedIndex].dataset.color)}}
              _dark={{
                color: "white"
              }}
            >
              <option value="Select One">Select One</option>
              {eventTypes && eventTypes.length >= 1 && eventTypes.map((type,i)=>{
                return (
                    <option 
                    key={type.id} 
                    style={{color: type.color.rgb ? type.color.rgb : "grey"}} 
                    data-color={type.color.hex ? type.color.hex : "#ababab"}
                    value={type.id}
                  >
                    {type.typeName}
                  </option>
                )
              })}
            </Select>
          </Flex>
          <Flex alignItems="center" gap={1} justifyContent="flex-end" w="100%">
            <Button colorScheme="yellow" size="sm" w="50%" onClick={e=>saveTypeColor(e)}>Save Color</Button>
            <Button colorScheme="red" size="sm" w="50%" onClick={e=>deleteType(e)}>Delete</Button>
          </Flex>
          <Text color="red">
            {typeFormErrorMsg ? typeFormErrorMsg : ""}
          </Text>
        </Flex>
        
        <Flex 
          backgroundColor="#f7f7f7" 
          color="black"
          rounded="md" 
          p={5} 
          flexDirection="column" 
          alignItems="flex-end" 
          justifyContent="flex-start"
          _dark={{
            backgroundColor: "var(--chakra-colors-gray-800)",
            color: "white"
          }}
        >
          <DrawerHeader alignSelf="flex-start" p="0 0 1rem 0">
            <Heading 
              as="h4" 
              color="black"
              size="md"
              _dark={{
                color: "white"
              }}
            >
              Equipment
            </Heading>
          </DrawerHeader>
          <Flex gap={2} mb={3}>
            <Input 
              size="sm" 
              color="black"
              borderColor="black" 
              id="equipmentName" 
              placeholder="Equipment Name" 
              type="text" 
              onChange={e=>setEquipmentName(e.target.value)}
              _dark={{
                color: "white"
              }}
            />
            <Button 
              colorScheme="green"
              size="sm"
              type="submit" 
              onClick={e=>{addEquipment(e)}}
            >
              Add
            </Button>
          </Flex>
          <Flex justifyContent="center" gap={1} w="100%">
            <Select 
              size="sm" 
              color="black"
              borderColor="black" 
              onChange={e=>{setDeleteEquipmentId(e.target.value)}}
              _dark={{
                color: "white"
              }}
            >
              <option value="Select One">Select One</option>
              {eventEquipment && eventEquipment.length >= 1 && eventEquipment.map((equipment,i)=>{
                return (
                  <option key={equipment['id']} value={equipment['id']}>{equipment['equipmentName']}</option>
                )
              })}
            </Select>
            <Button colorScheme="red" size="sm" data-deleteequipmentid={deleteEquipmentId} onClick={e=>deleteEquipment(e)}>Delete</Button>
          </Flex>
          <Text color="red">
            {equipmentFormErrorMsg ? equipmentFormErrorMsg : ""}
          </Text>
        </Flex>
      </DrawerBody>
    </DrawerContent>
  )
}

export default EventCalendarDrawers;