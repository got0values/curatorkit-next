'use client'

import {useState,useRef,useCallback} from 'react';
import { 
  Modal,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Box,
  Flex,
  Input,
  Heading,
  useToast
} from "@chakra-ui/react"
import JSONSchemaForm from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import { postRegForm } from "@/app/actions/frontendcalendar/frontendcalendar.actions";
import { SetFormType } from '@/app/types/types';
import {stringify, parse} from 'flatted';
import '../../css/form-bs.css';

type FormModalProps = {
  openFormModal: boolean;
  closeFormModal: ()=>void;
  initialRef: React.MutableRefObject<null>;
  form: SetFormType;
  primaryColor: string;
  fetchEvents:()=>Promise<void> ;
}

export default function FormModal(props: FormModalProps) {
  const toast = useToast();
  const {openFormModal, closeFormModal, initialRef, form, primaryColor, fetchEvents} = props;

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
            fetchEvents();
          }
          if (response.data === "Waiting List") {
            window.alert("Added to waiting list")
            closeFormModal();
            fetchEvents();
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
  },[fetchEvents])

  return(
    <Modal 
      isOpen={openFormModal} 
      onClose={closeFormModal} 
      initialFocusRef={initialRef}
      isCentered
    >
      <ModalOverlay/>
      <ModalContent
        ref={initialRef}
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
          <Heading as="h4" size="md">{JSON.parse(form.formschema).title ? JSON.parse(form.formschema).title : "Registration Form"}</Heading>              
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
  )
}