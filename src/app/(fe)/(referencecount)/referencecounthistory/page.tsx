'use client'

import React, {useState, useEffect, useRef} from 'react';
import moment from 'moment';
import { 
  Box, 
  Flex,
  Button, 
  Badge,
  Container, 
  Heading,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useToast
} from "@chakra-ui/react"
import paginate from '@/app/utils/paginate';
import PageNavigation from '@/app/utils/PageNavigation';

export default function RefCountHistory() {
  const [departments,setDepartments] = useState();
  const [types,setTypes] = useState();
  async function fetchDepartmentTypes() {
    try{
      await axios
        .get(server + `/refcountdepartmenttypes`, {
          headers : {
            'Content-Type':'application/json'
          }
        })
        .then((response)=>{
          setDepartments(response.data.departments)
          setTypes(response.data.types)
        })
    } catch(error) {
      console.log(error)
    }
  }
  useState(()=>{
    fetchDepartmentTypes()
  },[fetchDepartmentTypes])

  const [isLoading,setIsLoading] = useState(false);
  const [total,setTotal] = useState(0);
  const [refCounts, setRefCounts] = useState({});
  const inputDateRef = useRef();
  const inputDate2Ref = useRef();
  const departmentRef = useRef();
  const typeRef = useRef();
  const [pages, setPages] = useState([]);
  const fetchHistory = async (e) => {
    e.preventDefault();
    try {
        setIsLoading(true)
        await axios
        .get(server + `/refcounthistory?inputdate=${inputDateRef.current.value}&inputdate2=${inputDate2Ref.current.value}&department=${departmentRef.current.value}&type=${typeRef.current.value}`, {
            headers : {
                'Content-Type':'application/json'
            }
        })
        .then((response) => {
          setTotal(response.data.length)
          setRefCounts(response.data);
          setIsLoading(false)
        })
    } catch(error) {
        console.log(error);
    }
  }

  useEffect(()=>{
      setPages(paginate(refCounts,20))
    },[refCounts])

  const [page,setPage] = useState(0);
  function changePage(e) {
    e.preventDefault();
    let selectedPage = e.target;
    const pageButtons = document.querySelectorAll(".page-button")
    for (let pageButton of pageButtons) {
      pageButton.classList.remove("selected")
    }
    selectedPage.classList.add("selected")
    setPage(e.target.value)
  }

  const [openViewNotesModal,setOpenViewNotesModal] = useState(false)
  const [idNotes,setIdNotes] = useState(null);
  function viewNotes(e) {
    setIdNotes({
      datetime: e.target.dataset.datetime,
      department: e.target.dataset.department,
      type: e.target.dataset.type,
      notes: e.target.dataset.notes
    })
    setOpenViewNotesModal(true)
  }
  function closeModal() {
    setOpenViewNotesModal(false)
    setIdNotes(null)
  }

  return (
    <Box id="main">
      <Box 
        mt={4}
        pb={3}
        w="100%"
        position="relative"
      >
        <Box id="vr"></Box>
        <Heading as="h1" size="lg">Reference Count History</Heading>
      </Box>
      <Container maxW="1080px" mt={4}>
        <Flex flexWrap="wrap" gap={2} alignItems="center" justifyContent="center">

          <Flex gap={1} flexWrap="wrap" alignItems="center" justifyContent="center">
            <FormLabel htmlFor="department" margin={0}>Department:</FormLabel> 
            <Select 
              id="department"
              width="auto"
              ref={departmentRef}
            >
              <option value="All">All</option>
              {departments?.length > 0 && (
                departments.map((d)=>{
                  return (
                    <option 
                      key={d.id} 
                      value={d.id}
                    >
                      {d.name}
                    </option>
                  )
                })
              )}
            </Select>
          </Flex>
          <Flex gap={1} flexWrap="wrap" alignItems="center" justifyContent="center">
            <FormLabel htmlFor="type" margin={0}>Type:</FormLabel> 
            <Select 
              id="type"
              width="auto"
              ref={typeRef}
            >
              <option value="All">All</option>
              {types?.length > 0 && (
                types.map((t)=>{
                  return (
                    <option
                      key={t.id}
                      value={t.id}
                    >
                      {t.name}
                    </option>
                  )
                })
              )}
            </Select>
          </Flex>

          <Flex flexWrap="wrap" alignItems="center" justifyContent="center">
            <FormLabel htmlFor="inputDate" margin={0}>Date Range:</FormLabel>    
            <Input width="auto" type="date" id="inputDate" ref={inputDateRef}/>
            - 
            <Input width="auto" type="date" id="inputDate2" ref={inputDate2Ref}/>
          </Flex>
            
          <Button colorScheme="black" variant="outline" onClick={e=>fetchHistory(e)} id="button-addon2">Submit</Button>
        </Flex> 
        {!isLoading ? (
        <Box mt={6}>
          {total !== 0 ? (
          <Text color="gray">
            Total:  {total}
          </Text>
          ) : null}
          <TableContainer maxHeight="75vh" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>#</Th>    
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>Department</Th>
                  <Th>Type</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pages?.length > 0 && pages[page].map((rc, i)=>{
                  return (
                    <Tr key={i}>
                      <Td>
                        <Text color="gray">{page > 0 ? ((i + 1) + (page * 20)) : i + 1}</Text>
                      </Td>
                      <Td>{moment.utc(rc.datetime).local().format('MM-DD-Y')}</Td>
                      <Td>{moment.utc(rc.datetime).local().format('h:mm A')}</Td>
                      <Td>{rc.department}</Td>
                      <Td>{rc.type}</Td>
                      <Td>
                        {rc.notes !== "" ? (
                          <Button 
                            colorScheme="black"
                            variant="outline"
                            size="sm"
                            data-notes={rc.notes}
                            data-datetime={rc.datetime}
                            data-department={rc.department}
                            data-type={rc.type}
                            onClick={e=>viewNotes(e)}  
                          >
                            View
                          </Button>
                          ) : null}
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
          <PageNavigation pages={pages} changePage={changePage}/>
        </Box>
        ):(
          <div className="d-flex justify-content-center">
            <Loading/>
          </div>
        )}
        {openViewNotesModal &&
          <Modal isOpen={openViewNotesModal} onClose={closeModal} isCentered>
            <ModalOverlay/>
            <ModalContent minH="25vh">
              <ModalCloseButton/>
              <ModalHeader>
                <Flex width="100%" alignItems="center" justifyContent="space-between">
                  <Flex alignItems="center" gap={2}>
                    <Heading as="h4" size="md" mb={0}>
                      {moment.utc(idNotes.datetime).local().format('MMM Do, YYYY')}
                    </Heading>
                    <Text as="sub">{moment.utc(idNotes.datetime).local().format('H:mm A')}</Text>
                  </Flex>
                  <Flex gap={1} alignItems="center" mr={5} justifyContent="center">
                    <Badge colorScheme="green">
                      {idNotes.department}
                    </Badge>
                    <Badge colorScheme="yellow">
                      {idNotes.type}
                    </Badge>
                  </Flex>
                </Flex>
              </ModalHeader>
              <ModalBody pt={3} pe={5} pb={3} ps={5} className="pt-3 pe-5 pb-3 ps-5">
                <Flex flexDirection="column">
                  <Text>{idNotes.notes}</Text>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        }
      </Container>
    </Box>
  )
}