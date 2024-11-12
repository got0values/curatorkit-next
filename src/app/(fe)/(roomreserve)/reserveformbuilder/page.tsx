'use client'

import {useState,useEffect,useCallback} from 'react';
import {FormBuilder} from '@ginkgo-bioworks/react-json-schema-form-builder';
import { 
  Box, 
  Flex,
  Button,
  Heading,
  Select,
  useToast,
  Spinner
} from "@chakra-ui/react";
import JSONSchemaForm from "@rjsf/core";
import { deleteReserveForm, getReserveForms, postSaveReserveForm } from '@/app/actions/reserveformbuilder.actions';
import { ReserveFormType } from '@/app/types/types';
import validator from '@rjsf/validator-ajv8';
import '../../../css/form-bs.css';

export default function ReserveFormBuilder() {
  const toast = useToast();
  const [isLoading,setIsLoading] = useState(true);
  const [reserveSchema,setReserveSchema] = useState("");
  const [reserveUiSchema,setReserveUiSchema] = useState("");
  const [forms,setForms] = useState<ReserveFormType[] | []>([])
  const fetchForms = useCallback(async () => {
    await getReserveForms()
      .then((response) => {
        if (response.success) {
          setForms(response.data);
        }
        else {
          console.error(response.message);
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
  useEffect(()=>{
    setIsLoading(true);
    fetchForms()
    const previewBox: HTMLElement | null = document.getElementById("preview-box");
    if (previewBox) {
    var sticky = previewBox.offsetTop;
      window.onscroll = function() {
        if (window.scrollY > sticky) {
          previewBox.classList.add("sticky");
        }
        else {
          previewBox.classList.remove("sticky");
        }
      }
    }
    setIsLoading(false)
  },[fetchForms])

  async function saveForm() {
    await postSaveReserveForm(reserveSchema,reserveUiSchema)
      .then((response)=>{
        if (response.success) {
          window.alert("Saved!")
          fetchForms();
        }
        else {
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
  }

  const [formToDelete,setFormToDelete] = useState(null);
  async function deleteForm() {
    if (formToDelete !== null && formToDelete !== undefined) {
      if (window.confirm("WARNING: This will delete all registrations associated with this form. Are you sure you want to continue?")) {
      await deleteReserveForm(formToDelete)
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
          toast({
            description: res.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        })
      }
    }
  }

  return (
    <Box id="main">
      {isLoading ? (
        <>
          <Spinner size="xl"/>
        </>
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
                <Heading as="h1" size="lg">Reserve Form Builder</Heading>
              </Flex>
            </Box>
            <Flex alignItems="center">
              <Select 
                me={3}
                defaultValue={""} 
                onChange={(e: any)=>{
                  setReserveSchema(e.target.value)
                  setFormToDelete(e.target.options[e.target.selectedIndex].dataset.id)
                }}
              >
                <option value={""}>Use previous form as template?</option>
                {forms.length >= 1 && Object.values(forms).map((form,i)=>{
                  let formid = form.id;
                  let formSchema = JSON.stringify(form.form_schema);
                  let formtitle = form.title;
                  let formDate = form.date_created !== null ? " - " + form.date_created: "";
                  return (
                    <option 
                      key={formid} 
                      data-id={formid} 
                      value={formSchema}
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
              <Flex w="100%" flexWrap="wrap">
                <Flex 
                  w="100%" 
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
                      schema={reserveSchema}
                      uischema={reserveUiSchema}
                      onChange={(newReserveSchema,newReserveUiSchema) => {
                        setReserveSchema(newReserveSchema)
                        setReserveUiSchema(newReserveUiSchema)
                      }}
                    />
                  </Box>
                </Flex>
              </Flex>
              <Flex mt={4} mb={4}>
                <Flex w="100%" justifyContent="center">
                  <Button 
                    colorScheme="black"
                    variant="outline"
                    w="25%"
                    mb={5}
                    onClick={()=>saveForm()} 
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
                      uiSchema={reserveUiSchema ? JSON.parse(reserveUiSchema) : {}}
                      schema={reserveSchema ? JSON.parse(reserveSchema) : {}} 
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