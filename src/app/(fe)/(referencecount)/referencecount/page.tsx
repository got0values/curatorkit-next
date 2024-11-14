'use client'

import {useState,useEffect,useRef,useCallback} from 'react';
import { 
  Box, 
  Flex,
  Button, 
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Container, 
  Heading,
  FormLabel,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  CloseButton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  useToast
} from "@chakra-ui/react"
import {FaChevronLeft} from 'react-icons/fa';
import showAdminDrawer from '@/app/utils/showAdminDrawer';
import moment from 'moment';

export default function ReferenceCount() {
  const [showDrawer,setShowDrawer] = useState(false)

  const [modalIsEditableForNotes,setModalIsEditableForNotes] = useState(false)
  function closeModal() {
    setModalIsEditableForNotes(false)
    setNotesModalData(null)
    setFormErrorMsg(null)
    setDeleteDepartmentId(null)
    setDeleteTypeId(null)
    fetchReferenceCountData()
  }

  const [isLoading,setIsLoading] = useState(false)
  const [referenceCount,setReferenceCount] = useState()
  const [departments,setDepartments] = useState(null)
  const [types,setTypes] = useState(null)
  const [formErrorMsg,setFormErrorMsg] = useState(null)
  const fetchReferenceCountData = useCallback(async () => {
    try {
      setIsLoading(true)
      await axios
      .get(`${server}/referencecount`)
      .then((response) => {
        setReferenceCount(response.data.referencecount)
        setDepartments(response.data.departments)
        setTypes(response.data.types)
        setIsLoading(false)
      })
  } catch(error) {
      console.log(error);
  }
  },[])
  useEffect(()=>{
    fetchReferenceCountData()
  },[fetchReferenceCountData])

  const departmentIdRef = useRef()
  const typeIdRef = useRef()
  const notesRef = useRef()
  async function createReferenceCount(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/createreferencecount", {
          departmentid: departmentIdRef.current.value,
          typeid: typeIdRef.current.value,
          notes: notesRef.current.value

      })
      .then((response)=>{
        notesRef.current.value = "";
        fetchReferenceCountData();
      })
    } catch(error) {
        console.log(error);
    }
  }

  async function deleteReferenceCount(e,rCountId) {
    e.preventDefault()
    try {
      await axios
      .delete(server + "/deletereferencecount", {
          headers : {
              'Content-Type':'application/json'
          },
          data: {
            deletereferencecountid: JSON.stringify(rCountId)
          }
      })
      .then((response)=>{
        fetchReferenceCountData();
      })
    } catch(error) {
        console.log(error);
    }
  }

  const [notesModalData,setNotesModalData] = useState()
  const [editNotesMode,setEditNotesMode] = useState(false)
  function openViewNotesModal(e) {
    setModalIsEditableForNotes(true)
    setNotesModalData({
      id: e.target.dataset.id,
      notes: e.target.dataset.notes,
      datetime: e.target.dataset.datetime
    })
  }

  const departmentNameRef = useRef();
  async function createReferenceCountDepartment(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/createdepartment", {
          department_name: departmentNameRef.current.value
      })
      .then((response)=>{
        if (response.data === "OK") {
          fetchReferenceCountData();
        }
        else {
          setFormErrorMsg(response.data)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  const [deleteDepartmentId,setDeleteDepartmentId] = useState(null)
  async function deleteReferenceCountDepartment(e) {
    e.preventDefault();
    if (deleteDepartmentId !== null && deleteDepartmentId !== "") {
      if (window.confirm("Are you sure you would like to delete this room?\nDoing so will delete all history for this department")) {
        try {
          await axios
          .delete(server + "/deletedepartment", {
              headers : {
                  'Content-Type':'application/json'
              },
              data: {
                deletedepartmentid: JSON.stringify(deleteDepartmentId)
              }
          })
          .then((response)=>{
            if (response.data === "OK") {
              fetchReferenceCountData();
            }
            else {
              setFormErrorMsg(response.data)
            }
          })
        } catch(error) {
            console.log(error);
        }
      }
    }
  }

  const typeNameRef = useRef()
  async function createReferenceCountType(e) {
    e.preventDefault();
    try {
      await axios
      .put(server + "/createtype", {
          type_name: typeNameRef.current.value
      })
      .then((response)=>{
        if (response.data === "OK") {
          fetchReferenceCountData();
        }
        else {
          setFormErrorMsg(response.data)
        }
      })
    } catch(error) {
        console.log(error);
    }
  }

  const [deleteTypeId,setDeleteTypeId] = useState(null)
  async function deleteReferenceCountType(e) {
    e.preventDefault();
    if (deleteTypeId !== null && deleteTypeId !== "") {
      if (window.confirm("Are you sure you would like to delete this type?\nDoing so will delete all history for this type")) {
        try {
          await axios
          .delete(server + "/deletetype", {
              headers : {
                  'Content-Type':'application/json'
              },
              data: {
                deletetypeid: JSON.stringify(deleteTypeId)
              }
          })
          .then((response)=>{
            if (response.data === "OK") {
              fetchReferenceCountData();
            }
            else {
              setFormErrorMsg(response.data)
            }
          })
        } catch(error) {
            console.log(error);
        }
      }
    }
  }

  async function saveNotes(e) {
    try {
      await axios
      .post(server + "/saverefcountnotes", {
          notesid: notesModalData.id,
          notes: notesModalData.notes
      })
      .then((response)=>{
        setEditNotesMode(false)
      })
    } catch(error) {
        console.log(error);
    }
  }


  return (
    <>
      <Box id="main">
        <Box 
          mt={4}
          pb={3}
          w="100%"
          position="relative"
        >
          <Box id="vr"></Box>
          <Heading as="h1" size="lg">Reference Count</Heading>
        </Box>
        <Container maxW="1080px" mt={4}>
          <Button 
            colorScheme="black"
            variant="outline"
            position="fixed"
            top="10vh"
            right={0}
            ps={0}
            pe={0}
            minW={0}
            w={5}
            style={{display: `${showDrawer ? "none" : "block"}`}}
            onClick={e=>showAdminDrawer(server,setShowDrawer)}
          >
          <FaChevronLeft/>
          </Button>

          <Drawer 
            isOpen={showDrawer} 
            onClose={e=>setShowDrawer(false)} 
            scroll="true"
            placement="end"
          >
            <DrawerOverlay/>
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
                  <DrawerCloseButton 
                    color="black"
                    mt={6} 
                    mr={3}
                    _dark={{
                      color: "white"
                    }}
                  />
                  <DrawerHeader 
                    alignSelf="flex-start" 
                    p="0 0 1rem 0"
                  >
                    <Heading 
                      as="h4" 
                      color="black"
                      size="md"
                      _dark={{
                        color: "white"
                      }}
                    >
                      Departments
                    </Heading>
                  </DrawerHeader>
                  <Flex gap={2} mb={3}>
                    <Input 
                      size="sm" 
                      borderColor="black" 
                      color="black"
                      placeholder="Department Name" 
                      type="text" 
                      ref={departmentNameRef}
                      _dark={{
                        color: "white"
                      }}
                    />
                    <Button 
                      colorScheme="green"
                      size="sm"
                      type="submit" 
                      onClick={e=>{createReferenceCountDepartment(e)}}
                    >
                      Add
                    </Button>
                  </Flex>
                  <Flex justifyContent="center" gap={1} w="100%">
                    <Select 
                      size="sm" 
                      color="black"
                      borderColor="black" 
                      onChange={e=>{
                        setDeleteDepartmentId(e.target.value)
                      }}
                      _dark={{
                        color: "white"
                      }}
                    >
                      <option value="">Select One</option>
                      {departments && departments.length > 0 ? (
                        departments.map((department,i)=>{
                          return (
                            <option 
                              key={i}
                              value={department.id}
                            >
                                {department.name}
                            </option>
                          )
                        })
                      ) : null}
                    </Select>
                    <Button
                      colorScheme="red"
                      size="sm"
                      type="submit"
                      onClick={e=>deleteReferenceCountDepartment(e)}
                    >
                      Delete
                    </Button>
                  </Flex>
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
                  <DrawerHeader 
                    alignSelf="flex-start" 
                    p="0 0 1rem 0"
                  >
                    <Heading 
                      as="h4" 
                      color="black"
                      size="md"
                      _dark={{
                        color: "white"
                      }}
                    >
                      Types
                    </Heading>
                  </DrawerHeader>
                    <Flex 
                      mb={2} 
                      gap={1} 
                      justifyContent="center"
                    >
                      <Input 
                        size="sm" 
                        color="black"
                        borderColor="black" 
                        placeholder="Type Name" 
                        type="text" 
                        ref={typeNameRef}
                        _dark={{
                          color: "white"
                        }}
                      />
                      <Button 
                        colorScheme="green"
                        size="sm"
                        type="submit" 
                        onClick={e=>{createReferenceCountType(e)}}
                      >
                        Add
                      </Button>
                    </Flex>
                    <Flex justifyContent="center" gap={1} w="100%">
                      <Select 
                        size="sm" 
                        borderColor="black" 
                        color="black"
                        onChange={e=>setDeleteTypeId(e.target.value)}
                        _dark={{
                          color: "white"
                        }}
                      >
                        <option value="">Select One</option>
                        {types && types.length > 0 ? (
                          types.map((type,i)=>{
                            return (
                              <option 
                                key={i}
                                value={type.id}
                              >
                                  {type.name}
                              </option>
                            )
                          })
                        ) : null}
                      </Select>
                      <Button
                        colorScheme="red"
                        size="sm"
                        type="submit"
                        onClick={e=>deleteReferenceCountType(e)}
                      >
                        Delete
                      </Button>
                    </Flex>
                </Flex>
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          <Flex alignItems="center" justifyContent="center" mt={4}>
            <Flex 
              flexDirection="column" 
              justifyContent="center" 
              gap={2} 
              mx={2} 
              p={5}
              border="1px"
              borderColor="inherit"
              rounded="md" 
              boxShadow="md"
            >
              <Flex alignItems="center" justifyContent="center">
                <Heading as="h4" size="md">{moment(new Date()).format('ddd, MMM D, YYYY').toString()}</Heading>
              </Flex>
              <Box alignSelf="center">
                <Flex>
                  <FormLabel htmlFor="department">Department:</FormLabel>
                </Flex>
                <Flex>
                  <Select 
                    id="department" 
                    ref={departmentIdRef}
                  >
                    {departments && departments.length > 0 ? (
                      departments.map((department,i)=>{
                        return (
                          <option key={i} value={department.id}>{department.name}</option>
                        )
                      })
                    ): null}
                  </Select>
                </Flex>
              </Box>

              <Box alignSelf="center">
                <Flex>
                  <FormLabel htmlFor="referencetype">Type:</FormLabel>
                </Flex>
                <Flex>
                  <Select 
                    id="referencetype" 
                    ref={typeIdRef}
                  >
                    {types && types.length > 0 ? (
                      types.map((type,i)=>{
                        return (
                          <option key={i} value={type.id}>{type.name}</option>
                        )
                      })
                    ): null}
                  </Select>
                </Flex>
              </Box>

              <Flex px={2} flexDirection="column" alignItems="center">
                <Box>
                  <FormLabel htmlFor="notestext">Notes:</FormLabel>
                </Box>
                <Textarea 
                  id="notestext" 
                  cols="25"
                  ref={notesRef}
                />
              </Flex>

              <Flex ms="auto" me="auto" alignItems="center" justifyContent="flex-end">
                <Button 
                  colorScheme="green"
                  onClick={e=>createReferenceCount(e)}
                >
                  Submit
                </Button>
              </Flex>

            </Flex>
          </Flex>

          <Box py={5}>
            {!isLoading ? (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Time</Th>
                    <Th>Department</Th>
                    <Th>Type</Th>
                    <Th>Notes</Th>
                    <Th>Delete</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {referenceCount?.map((rc,i)=>
                    <Tr key={i}>
                      <Td><Text color="gray">{i+1}</Text></Td>
                      <Td>{moment.utc(rc["datetime"]).local().format('h:mm A').toString()}</Td>
                      <Td>{rc["department"]}</Td>
                      <Td>{rc["type"]}</Td>
                      <Td>
                        {rc["notes"] === "" ? (
                          <Button 
                            colorScheme="black"
                            variant="outline"
                            data-id={rc["id"]}
                            data-notes={rc["notes"]}
                            data-datetime={moment(rc["datetime"]).format('h:mm A').toString()}
                            onClick={e=>openViewNotesModal(e)}
                          >
                            Add
                          </Button>
                          ) : (
                          <Button 
                            colorScheme="black"
                            variant="outline"
                            data-id={rc["id"]}
                            data-notes={rc["notes"]}
                            data-datetime={moment(rc["datetime"]).format('h:mm A').toString()}
                            onClick={e=>openViewNotesModal(e)}
                          >
                            View
                          </Button>
                        )}
                      </Td>
                      <Td>
                        <CloseButton
                          color="red"
                          onClick={e=>deleteReferenceCount(e,rc.id)}
                        />
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
            ): (
            <Flex justifyContent="center" className="d-flex justify-content-center">
              <Loading/>
            </Flex>
            )}

          </Box>
        </Container>
      </Box>

      {modalIsEditableForNotes &&
        <Modal isOpen={modalIsEditableForNotes} onClose={closeModal} isCentered>
          <ModalOverlay/>
          <ModalContent>
            <ModalHeader>
              <Flex alignItems="center" justifyContent="space-between">
                {notesModalData?.datetime}
                <ModalCloseButton/>
              </Flex>
            </ModalHeader>
            <ModalBody>
              {editNotesMode === false ? (
              <Box 
                m={3}
                p={2}
              >
                {notesModalData?.notes}
              </Box>
              ):(
                <Flex justifyContent="center">
                  <Textarea 
                    width="100%"
                    height="10em"
                    onChange={e=>setNotesModalData({...notesModalData, notes: e.target.value })}
                    value={notesModalData?.notes}
                  />
                </Flex>
              )}
            </ModalBody>
            <ModalFooter display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
              {editNotesMode === true ? (
              <>
                <Button 
                  colorScheme="green"
                  onClick={e=>saveNotes(e)}
                >
                  Save
                </Button>
                <Button 
                  colorScheme="gray"
                  onClick={e=>setEditNotesMode(false)}
                >
                  Cancel
                </Button>
              </>
              ) : (
              <Button 
                colorScheme="yellow"
                onClick={e=>setEditNotesMode(true)}
              >
                Edit
              </Button>
              )}
              <Button 
                colorScheme="red"
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      }
    </>
  )
}