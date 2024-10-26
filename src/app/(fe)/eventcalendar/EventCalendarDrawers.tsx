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
  Text, 
  useToast
} from "@chakra-ui/react"
import { hexToRgb } from '../../utils/hexToRgb';
import { postRoom, deleteRoom, postType, postTypeColor } from '@/app/actions/eventcalendar/drawers.actions';
import { EventType, EventRoomType, EventTypeType, EquipmentType, GetEventsReturnType } from '@/app/types/types';

type EventCalendarDrawersProps = {
  fetchEvents: ()=>Promise<void>,
  eventRooms: EventRoomType[],
  setRoomFormErrorMsg: React.Dispatch<React.SetStateAction<string>>,
  roomFormErrorMsg: string,
  eventTypes: EventTypeType[],
  eventEquipment: EquipmentType[],
  closeModal: ()=>void
}

const EventCalendarDrawers = (props: EventCalendarDrawersProps) => {
  const {fetchEvents,eventRooms,setRoomFormErrorMsg,roomFormErrorMsg,eventTypes,eventEquipment,closeModal} = props;

  const toast = useToast();

  const [roomName,setRoomName] = useState<string>("");
  const [deleteRoomId,setDeleteRoomId] = useState("");
  async function addRoom(e: any) {
    e.preventDefault();
    await postRoom(roomName)
      .then(async (response)=>{
        if (response.success) {
          setRoomName("");
          closeModal();
          await fetchEvents();
        }
        else {
          setRoomFormErrorMsg(response.message);
          toast({
            description: response.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((error)=> {
        console.error(error)
        toast({
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
  }

  async function removeRoom(e: any) {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this room?")) {
      await deleteRoom(deleteRoomId)
        .then((response)=>{
          if (response.success) {
            closeModal();
            fetchEvents();
          }
          else {
            setRoomFormErrorMsg(response.data)
            toast({
              description: response.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          }
        })
        .catch((error)=>{
          console.error(error)
          toast({
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        })
    }
  }

  const [typeName,setTypeName] = useState("");
  const eventTypeColorRef = useRef();
  const [typeFormErrorMsg,setTypeFormErrorMsg] = useState();
  async function addType(e: any) {
    e.preventDefault();
    try {
      await postType(typeName, {hex: (eventTypeColorRef.current as any).value,rgb: hexToRgb((eventTypeColorRef.current as any).value)})
        .then((response)=>{
          if (response.success) {
            setTypeName("");
            closeModal();
            fetchEvents();
          }
          else {
            setTypeFormErrorMsg(response.data)
            toast({
              description: response.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
            console.error(response)
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
        console.log(error);
    }
  }

  const [eventTypeColorEdit,setEventTypeColorEdit] = useState("");
  const [eventTypeId,setEventTypeId] = useState("");
  async function saveTypeColor(e: any) {
    e.preventDefault();
    if (eventTypeId !== "") {
      await postTypeColor(eventTypeId, {hex: eventTypeColorEdit, rgb: hexToRgb(eventTypeColorEdit)})
        .then(async (response)=>{
          if (response.success) {
            await fetchEvents();
            toast({
              description: "Event type color saved",
              status: 'success',
              duration: 4000,
              isClosable: true,
            });
          }
          else {
            setTypeFormErrorMsg(response.data)
            toast({
              description: response.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
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
    }
  }

  async function deleteType(e: any) {
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
  async function addEquipment(e: any) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/eventequipment", {
          equipmentform: {
              equipment_name: equipmentName
          }
      })
      .then((response)=>{
        if (response.success) {
          setEquipmentName("");
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

  async function deleteEquipment(e: any) {
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
          if (response.success) {
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
              <option value="">Select One</option>
              {eventRooms && eventRooms.length >= 1 && eventRooms.map((room)=>{
                return (
                  <option key={room.id} value={room.id}>{room.name}</option>
                )
              })}
            </Select>
            <Button colorScheme="red" size="sm" onClick={e=>removeRoom(e)}>Delete</Button>
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
            <Input type="color" ref={eventTypeColorRef as any} size="sm" p={0} w={100}/>
            <Input 
              size="sm" 
              color="black"
              borderColor="black" 
              placeholder="Event Type" 
              type="text" 
              onChange={(e: any)=>setTypeName(e.target.value)}
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
              value={eventTypeColorEdit}
              onChange={(e: any)=>setEventTypeColorEdit(e.target.value)}
              p={0} 
              w={100}
            />
            ) : null}
            <Select 
              size="sm" 
              color="black"
              borderColor="black" 
              value={eventTypeId}
              onChange={(e: any)=>{
                setEventTypeId(e.target.options[e.target.selectedIndex].value);
                console.log(e.target.options[e.target.selectedIndex].dataset.color)
                setEventTypeColorEdit(e.target.options[e.target.selectedIndex].dataset.color)
              }}
              _dark={{
                color: "white"
              }}
            >
              <option value="">Select One</option>
              {eventTypes && eventTypes.length >= 1 && eventTypes.map((type,i)=>{
                return (
                    <option 
                    key={type.id} 
                    style={{color: type.color.rgb ? type.color.rgb : "grey"}} 
                    data-color={type.color.hex ? type.color.hex : "#ababab"}
                    value={type.id}
                  >
                    {type.name}
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
              onChange={(e: any)=>setEquipmentName(e.target.value)}
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
              onChange={(e: any)=>{setDeleteEquipmentId(e.target.value)}}
              _dark={{
                color: "white"
              }}
            >
              <option value="Select One">Select One</option>
              {eventEquipment && eventEquipment.length >= 1 && eventEquipment.map((equipment,i)=>{
                return (
                  <option key={equipment.id} value={equipment.id}>{equipment.name}</option>
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