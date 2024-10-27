'use client'

import { 
  Button, 
  Table,
  Tbody,
  Tr,
  Td,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Link
} from "@chakra-ui/react";
import moment from 'moment';
import { EventType, EquipmentType } from "@/app/types/types";

type ViewModalProps = {
  modalData: EventType,
  handleEditClick: ()=>void,
  deleteEvent: (e:any)=>Promise<void>,
  handleDuplicateEventClick: (e:any)=>void,
  eventEquipment: EquipmentType[]
}

const ViewModal = (props: ViewModalProps) => {
  const {modalData, handleEditClick, deleteEvent, handleDuplicateEventClick, eventEquipment} = props;

  return (
    <>
      <ModalOverlay/>
      <ModalContent>
        <ModalCloseButton/>
        <ModalHeader>
            {modalData.event}
        </ModalHeader>
        <ModalBody display="flex" justifyContent="center">
          <Table size="sm">
            <Tbody>
              <Tr>
                <Td><Text fontWeight="bold">Date:</Text> </Td>
                <Td>{moment(modalData.reservedate).format('ddd, MMMM DD')}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Room:</Text> </Td>
                <Td>{modalData.room?.name}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Reserve start:</Text> </Td>
                <Td>{moment(modalData.reservestart).format('h:mm A')}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Reserve end:</Text> </Td>
                <Td>{moment(modalData.reserveend).format('h:mm A')}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Event start:</Text> </Td>
                <Td>{moment(modalData.eventstart).format('h:mm A')}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Event end:</Text> </Td>
                <Td>{moment(modalData.eventend).format('h:mm A')}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Event type:</Text> </Td>
                <Td>{!modalData.typeid ? "None" : modalData.type?.name}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Registration Form:</Text> </Td>
                <Td>
                  <Text as="span" color="blue" textDecoration="underline">
                    {modalData.formmeta ? (
                      <Link href={`/rcforms/${modalData.formmeta.id}`}>
                        {modalData.formmeta.title}
                      </Link>
                      ) : ""}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Attendees</Text></Td>
                <Td>{modalData.formmeta ? (
                      modalData.formmeta.attendees
                    ) : ""}
                </Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Waiting List:</Text></Td>
                <Td>{modalData.formmeta ? (
                  modalData.formmeta.waitinglist
                  ) : ""}
                </Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Event Hidden:</Text> </Td>
                <Td>{modalData.eventhidden === true ? "Yes" : "No"}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">tags:</Text> </Td>
                <Td>{modalData.tags.join(", ")}</Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Equipment:</Text> </Td>
                <Td>
                  {modalData.equipment_ids?.map((eid,i)=>(
                      modalData.equipment_ids?.length > 1 && 
                      eventEquipment.find((eq)=>eq.id.toString() === eid)?.name) !== undefined ? (
                      <Text as="span" key={i}>
                        {eventEquipment.find((eq)=>eq.id.toString() === eid)?.name}
                        {i !== modalData.equipment_ids.length - 1 && ","}
                      </Text>
                    ) : "")
                  }
                </Td>
              </Tr>
              <Tr>
                <Td><Text fontWeight="bold">Notes:</Text></Td>
                <Td>{modalData.notes}</Td>
              </Tr>
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="yellow"
            m={1}
            data-editeventdata={JSON.stringify(modalData)}
            onClick={()=>handleEditClick()}
          >
            Edit
          </Button>
          <Button 
            colorScheme="green" 
            m={1}
            data-duplicateeventdata={JSON.stringify(modalData)}
            onClick={e=>handleDuplicateEventClick(e)}
          >
            Duplicate
          </Button>
          <Button 
            colorScheme="red"
            m={1}
            data-eventid={modalData.transid}
            onClick={e=>deleteEvent(e)}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  )
}

export default ViewModal;