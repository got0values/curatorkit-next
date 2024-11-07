'use client'

import {useState,useEffect,useRef,useCallback} from 'react';
import {FormBuilder} from '@ginkgo-bioworks/react-json-schema-form-builder';
import { 
  Box, 
  Flex,
  Button,
  Heading,
  Select,
  Input,
  Text,
  Spinner
} from "@chakra-ui/react";
import JSONSchemaForm from "@rjsf/core";
import { getEventForms, postSaveForms, deleteEventForm } from '@/app/actions/formbuilder.actions';
import { EventFormType } from '@/app/types/types';
import validator from '@rjsf/validator-ajv8';
import '../../css/form-bs.css';

export default function CalendarFormBuilder () {
  const [isLoading,setIsLoading] = useState(true);
  const [calSchema,setCalSchema] = useState("");
  const [calUiSchema,setCalUiSchema] = useState("");
  const [forms,setForms] = useState<EventFormType[] | []>([])
  const fetchForms = useCallback(async () => {
    await getEventForms()
    .then((response) => {
      setForms(response.data);
    })
    .catch((res)=>{
      console.error(res)
    })
  },[])

  useEffect(()=>{
    setIsLoading(true);
    fetchForms()
    setIsLoading(false);
    const previewBox: HTMLElement | null = document.getElementById("preview-box");
    var sticky = previewBox?.offsetTop;
    if (sticky && previewBox){
      window.addEventListener("scroll",function() {
        if (window.scrollY > sticky!) {
          previewBox?.classList.add("sticky");
        }
        else {
          previewBox.classList.remove("sticky");
        }
      })
    }
  },[fetchForms])

  const attendeesRef = useRef();
  const waitingListRef = useRef();
  async function saveForm() {
    try {
      let eventForm = {
        form_schema: calSchema,
        form_ui_schema: calUiSchema,
        attendees: (attendeesRef.current as any).value,
        waitinglist: (waitingListRef.current as any).value
      }
      await postSaveForms(eventForm as EventFormType)
      .then((response)=>{
        if (response.success) {
          window.alert("Saved!")
          fetchForms();
        }
        else {
          window.alert(response.message)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  const [formToDelete,setFormToDelete] = useState("");
  async function deleteForm() {
    if (formToDelete !== null && formToDelete !== undefined) {
      if (window.confirm("WARNING: This will delete all registrations associated with this form. Are you sure you want to continue?")) {
        await deleteEventForm(formToDelete)
          .then((response)=>{
            if (response.success) {
              fetchForms();
            }
            else {
              window.alert("Unsuccessful")
            }
          })
        .catch((res)=>{
          console.error(res)
        })
      }
    }
  }

  return (
    <Box id="main" >
      {isLoading ? (
        <Flex align="center" justify="center">
          <Spinner size="xl"/>
        </Flex>
      ): (
        <>
          <Flex 
            alignItems="center" 
            justifyContent="space-between" 
            mt={4}
            mb={4}
            pb={3}
            position="relative"
          >
            <Box>
              <Box id="vr"></Box>
              <Flex w="100%" >
                <Heading as="h1" size="lg">Event Form Builder</Heading>
              </Flex>
            </Box>
            <Flex alignItems="center">
              <Select 
                me={3}
                defaultValue={""} 
                onChange={e=>{
                  setCalSchema(e.target.value)
                  setFormToDelete(e.target.options[e.target.selectedIndex].dataset.id!)
                }}
              >
                <option value={""}>Use previous form as template?</option>
                {forms.length >= 1 && Object.values(forms).map((form,i)=>{
                  let formid = form.id;
                  let formSchema = form.form_schema;
                  let formtitle = form.title;
                  let formDate = form.date_created !== null ? " - " + form.date_created: "";
                  return (
                    <option 
                      key={formid} 
                      data-id={formid} 
                      value={formSchema as string}
                    >
                      {formtitle} {formDate}
                    </option>
                  )
                })}
              </Select>
              <Button 
                colorScheme="red"
                w="auto"
                onClick={()=>deleteForm()}
              >
                Delete
              </Button>
            </Flex>
          </Flex>
          <Flex h="100%" mt={2} mb={5}>
            <Flex h="100%" maxH="100vh" w="100%" flexDirection="column" pt={4} borderEnd="1px" borderColor="inherit">
              <Flex w="100%" flexWrap="wrap" justify="space-between">
                <Flex 
                  w="80%" 
                  maxW="100%" 
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    '& [class*="formBuilder-"]': {
                      width: '100%'
                    },
                    '& [class*="formHead-"]': {
                      padding: '0',
                      width: "100%",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                      border: '1px solid lightgray',
                      'div': {
                        width: '40%'
                      }
                    },
                    '& [class*="formBody-"]': {
                      width: "100%",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                      '.card-container': {
                        border: '1px solid #dbdbdb',
                        '.d-flex': {
                          borderBottom: "none"
                        }
                      }
                    }
                  }}
                >
                  <Box className="form-builder">
                    <FormBuilder
                      schema={calSchema}
                      uischema={calUiSchema}
                      onChange={(newCalSchema,newCalUiSchema) => {
                        setCalSchema(newCalSchema)
                        setCalUiSchema(newCalUiSchema)
                      }}
                    />
                  </Box>
                </Flex>
                <Flex w="15%" h="auto" maxW="100%">
                  <Box 
                    border="1px solid lightgray"
                    bg="#EBEBEB"
                    color="gray"
                    w="100%"
                    maxW="100%"
                    h="fit-content"
                    p={3}
                    rounded="md"
                  >
                    <Box>
                      <Text fontWeight="bold">Attendees:</Text>
                      <Input type="number" bg="white" defaultValue={0} ref={attendeesRef as any}/>
                    </Box>
                    <Box>
                      <Text as="strong">Waiting list:</Text>
                      <Input type="number" bg="white" defaultValue={0} ref={waitingListRef as any}/>
                    </Box>
                  </Box>
                </Flex>
              </Flex>
              <Flex mt={4} mb={4}>
                <Flex w="80%" justifyContent="center">
                  <Button 
                    colorScheme="black"
                    variant="outline"
                    w="25%"
                    mb={5}
                    onClick={e=>saveForm()} 
                  >
                    Save Form
                  </Button>
                </Flex>
              </Flex>
            </Flex>

            <Box
              w="35%"
              mb={3}
            >
              <Box 
                p={4}
                sx={{
                  color: 'black',
                  '& button': {
                    backgroundColor: '#0d6efd',
                    color: 'white',
                    borderColor: '#0d6efd'
                  },
                  '.sticky': {
                    position: "fixed",
                    top: 0
                  }
                }}
              >
                <Heading as="h5" size="sm" mb="1rem">Preview:</Heading>
                <Flex 
                  id="preview-box"
                  justifyContent="center" 
                  bg="white" 
                  rounded="md" 
                  boxShadow="md" p={4}
                >
                  <Box className="json-schema-form">
                    <JSONSchemaForm 
                      uiSchema={calUiSchema ? JSON.parse(calUiSchema) : {}} 
                      schema={calSchema ? JSON.parse(calSchema) : {}} 
                      validator={validator}
                    />
                  </Box>
                </Flex>
              </Box>
            </Box>

          </Flex>
        </>
      )}
    </Box>
  )
}