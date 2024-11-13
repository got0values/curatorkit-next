'use client'

import React, {useState, useEffect, useRef, useCallback, Fragment} from 'react';
import { 
  Box, 
  Flex,
  Button, 
  Container, 
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Badge,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  useToast
} from "@chakra-ui/react";
import moment from 'moment';
import JSONSchemaForm from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import '../../../../css/form-bs.css';
import { stringify, parse } from 'flatted';
import { getEventFormsData, getFormSchema, postEventFormsBackend, postEventFormsBackendNew, deleteEventFormData, putUpdateEventFormAttendees } from '@/app/actions/eventcalendar/eventforms.actions';
import { EventFormDataType } from '@/app/types/types';

export default function EventForms({params}: {params: {slug: string}}) {
  let formId = params.slug;
  const toast = useToast();
  const [formData, setFormData] = useState<EventFormDataType[] | []>([]);
  const [errorMsg,setErrorMsg] = useState("");
  const [attendeesFetch,setAttendeesFetch] = useState(0);
  const [waitingListFetch,setWaitingListFetch] = useState(0);
  const fetchForm = useCallback(async () => {
    await getEventFormsData(formId)
      .then((response) => {
        if (response.success) {
          const formDataResponse = response.data;
          setAttendeesFetch(formDataResponse.attendees);
          setWaitingListFetch(formDataResponse.waitingList);
          if (formDataResponse === "Form does not exist") {
            setErrorMsg(formDataResponse)
          }
          else {
            const formDataSorted = formDataResponse.formData.sort((a: any, b: any)=>{
              return (new Date(a.datetime) as any) - (new Date(b.datetime) as any)
            })
            const formDataLocalized = formDataSorted.map((fd: any)=>{
              return {...fd, datetime: moment.utc(fd.datetime).local().format('MM/DD/YY h:mm A')}
            })
            setFormData(formDataLocalized);
          }
        }
        else {
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
  },[formId])
  useEffect(()=>{
    fetchForm()
  },[fetchForm])

  type SetFormSchemaDataType = {
    id?: number | null;
    formdata?: string | null;
    schemas?: {
      schema: string;
      uiSchema: string;
    };
    formSchemaDataId?: string;
  }

  const [modalOpen,setModalOpen] = useState(false);
  const [formSchemaData,setFormSchemaData] = useState<SetFormSchemaDataType | null>(null);
  const handleModalOpenForEditOrAdd = useCallback(async (e: any, editOrAdd: string)=>{
    if (editOrAdd === "edit") {
      const formId = e.currentTarget.dataset.formid;
      const formDataId = e.currentTarget.dataset.formdataid;
      await getFormSchema(formId)
        .then((response)=>{
          if (response.success) {
            for (let fd of formData) {
              if (fd.id === parseInt(formDataId)) {
                setFormSchemaData({id: fd.id, formdata: fd.form_data, schemas: {schema: response.data.schema, uiSchema: response.data.uiSchema}})
                setModalOpen(true);
              }
            }
          }
          else {
            console.error(response)
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
    }
    else if (editOrAdd === "add") {
      const eventFormId = e.currentTarget.dataset.formid;
      await getFormSchema(eventFormId)
        .then((response) => {
          if (response.success) {
            setFormSchemaData({schemas: {schema: response.data.schema, uiSchema: response.data.uiSchema}, id: null, formSchemaDataId: eventFormId});
            setModalOpen(true);
          }
          else {
            console.error(response.message)
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
    }
  },[formData])

  const closeModal = useCallback(()=>{
    setModalOpen(false)
  },[])

  const regFormIdRef = useRef<any>();
  const submitRegForm = useCallback(async (e: any) => {
    const id = regFormIdRef.current.value;
    const regFormDataId = regFormIdRef.current.dataset.formschemaid;
    if (id !== "no") {
      await postEventFormsBackend(stringify(e), regFormIdRef.current.value)
        .then((response)=>{
          if (response.success){
            closeModal();
            fetchForm();
          }
          else {
            console.error(response)
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
    }
    else if (regFormDataId !== null) {
      await postEventFormsBackendNew(stringify(e), regFormDataId)
        .then((response)=>{
          if (response.success) {
            closeModal();
            fetchForm();
          }
          else {
            console.error(response)
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
    }
  },[fetchForm, closeModal])

  const deleteFormData = useCallback(async (e: any)=>{
    if (window.confirm("Are you sure you would like to delete this entry?")) {
      await deleteEventFormData(e.target.dataset.formid)
        .then((response)=>{
          if (response.success) {
            fetchForm();
            toast({
              description: "Form deleted",
              status: 'success',
              duration: 9000,
              isClosable: true,
            });
          }
          else {
            console.error(response)
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
          });
        })
    }
  },[fetchForm])

  const attendeesRef = useRef<any>();
  const waitingListRef = useRef<any>();
  const saveAttendeesWaitingList = async () => {
    let attendeesData = attendeesRef.current.value;
    let waitingListData = waitingListRef.current.value;
    await putUpdateEventFormAttendees(attendeesData, waitingListData, formId)
      .then((response)=>{
        if (response.success) {
          fetchForm();
          toast({
            description: "Saved",
            status: 'success',
            duration: 9000,
            isClosable: true,
          });
        }
        else {
          console.error(response)
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
  }

  return (
    <Box id="main">
      {!errorMsg ? (
        <>
          <Box
            position="relative"
          >
            <Box id="vr"></Box>
            <Flex w="100%" >
              <Heading as="h1" size="lg" mb={3} mt={3}>
                Form Data</Heading>
            </Flex>
          </Box>
          <Container maxW="100%" mt={4}>
            {formData ? (
            <>
              <Heading as="h3" size="md" textAlign="center" mb={3} mt={3}>
                {formData && formData.length ? parse(formData[0].form_data!).schema.title : "Event Forms"}
              </Heading>
              <Flex overflow="auto" flexWrap="wrap" gap={3} w="100%">
                <Box
                  shadow="lg" 
                  py={5} 
                  px={5}
                  pb={1}
                  border="1px solid"
                  borderColor="inherit"
                  rounded="md"
                  overflow="auto"
                  flex="1 0 75%"
                  height="100%"
                >
                  <Table 
                    size="sm" 
                  >
                    <Thead>
                        <Tr>
                          <Th>#</Th>
                          <Th></Th>
                        {Object.keys(formData && formData.length && parse(formData[0].form_data!).schema.properties).map((object,i)=>{
                          return (
                            <Fragment key={i}>
                              <Th scope="col">{object}</Th>
                            </Fragment>
                          )
                        })}
                        <Th>Date/Time</Th>
                        <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                      {formData && formData.map((formObject,i)=>{
                        return (
                          <Tr 
                            key={formObject.id}
                          >
                            <Td>{i + 1}</Td>
                            <Td>{formData.length && i + 1 > attendeesFetch ? (
                            <Badge colorScheme="red">Waiting List</Badge>) : ""}</Td>
                            {Object.keys(formData.length && parse(formData[0].form_data!).schema.properties).map((keyName,i)=>{
                              return (
                                <Td key={i}>
                                  {parse(formObject.form_data!).formData[keyName] ? parse(formObject.form_data!).formData[keyName] : "n/a"}
                                </Td>
                              )
                            })}
                            <Td>
                              {formObject.datetime.toLocaleString()}
                            </Td>
                            <Td display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                              <Button 
                                colorScheme="black"
                                variant="outline"
                                size="sm"
                                data-formid={formId}
                                data-formdataid={formObject.id}
                                onClick={e=>handleModalOpenForEditOrAdd(e, "edit")}
                              >
                                Edit
                              </Button>
                              <Button 
                                colorScheme="red"
                                size="sm"
                                data-formid={formObject.id}
                                onClick={e=>deleteFormData(e)}
                              >
                                Delete
                              </Button>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                  <Flex alignItems="center" justifyContent="center" mt={3} mb={3}>
                    <Button 
                      colorScheme="green"
                      size="sm"
                      data-formid={formId}
                      onClick={e=>handleModalOpenForEditOrAdd(e, "add")}
                    >
                      +Add
                    </Button>
                  </Flex>
                </Box>
                <Flex 
                  flexDirection="column" 
                  shadow="md" 
                  p={5} 
                  gap={2} 
                  border="1px solid"
                  borderColor="inherit"
                  rounded="md"
                  flex="1 1 20%"
                  height="100%"
                >
                  <FormLabel 
                    htmlFor="attendees"
                    mb={0}
                  >
                    Attendees
                  </FormLabel>
                  <Input 
                    id="attendees"
                    type="number"
                    min="0"
                    ref={attendeesRef as any}
                    defaultValue={attendeesFetch ? attendeesFetch : 0}
                  />
                  <FormLabel 
                    htmlFor="waiting-list"
                    mb={0}
                  >
                    Waiting List
                  </FormLabel>
                  <Input 
                    id="waiting-list"
                    type="number"
                    min="0"
                    ref={waitingListRef as any}
                    defaultValue={waitingListFetch ? waitingListFetch : 0}
                  />
                  <Button
                    size="sm"
                    onClick={()=>saveAttendeesWaitingList()}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            </>
            ) : ""}
          </Container>
          {formSchemaData ? (
          <Modal isOpen={modalOpen} onClose={closeModal} isCentered>
            <ModalOverlay/>
            <ModalContent>
              <ModalCloseButton/>
              <ModalHeader>
                {formSchemaData.formdata && parse(formSchemaData.formdata).schema.title ? parse(formSchemaData.formdata).schema.title : ""}
              </ModalHeader>
              <ModalBody>
                <Input 
                  type="hidden" 
                  data-formschemaid={formSchemaData.formSchemaDataId ? formSchemaData.formSchemaDataId : null}
                  value={formSchemaData.id ? formSchemaData.id : undefined} 
                  ref={regFormIdRef as any}
                />
                <Box className="json-schema-form">
                  <JSONSchemaForm 
                    uiSchema={formSchemaData?.schemas ? JSON.parse(formSchemaData.schemas.uiSchema) : {}} 
                    schema={formSchemaData.schemas ? JSON.parse(formSchemaData.schemas.schema) : {}}
                    // onChange={e=>console.log(e)}
                    validator={validator}
                    onSubmit={e=>submitRegForm(e)}
                  />
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
          ) : ""}
        </>
      ) : (
        <Text color="red">{errorMsg}</Text>
      )}
    </Box>
  )
}