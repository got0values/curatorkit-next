'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import paginate from '../../utils/paginate';
import PageNavigation from '../../utils/PageNavigation';
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
  Spinner
} from "@chakra-ui/react"
import { getNameList, postAddCard, deleteCard, postAddCards } from '@/app/actions/namelist.actions';
import { NameListType } from '@/app/types/types';

const NameList = () => {
  const [nameList, setNameList] = useState<any[]>([]);
  const [bcInput, setBcInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);

  const fetchNameList = useCallback(async () => {
    try {
      setIsLoading(true)
      await getNameList()
        .then((response) => {
          setIsLoading(false)
          setNameList(response.data);
        })
    } catch(error) {
        console.log(error);
        setIsLoading(false)
    }
  },[])

  useEffect(()=>{
      fetchNameList();
  },[fetchNameList])

  useEffect(()=>{
    setPages(paginate(nameList,100))
  },[nameList])

  const [page,setPage] = useState(0);
  function changePage(e: any) {
    e.preventDefault();
    let selectedPage = e.target;
    const pageButtons = document.querySelectorAll(".page-button")
    pageButtons.forEach(pb=>{
      pb.classList.remove("selected")
    })
    selectedPage.classList.add("selected")
    setPage(e.target.value)
  }

  const bcInputText = useRef<any>();
  const nameInputText = useRef<any>();
  const bcNameInputFunction = async (e: any) => {
    e.preventDefault();
    try {
      await postAddCard(bcInput,nameInput);
    } catch(error) {
        console.log(error);
    }
    (bcInputText.current as any).value = "";
    (nameInputText.current as any).value = "";
    fetchNameList();
    (bcInputText.current as any).focus();
  }

  const deleteName = async (e: any) => {
    e.preventDefault();
    try {
      await deleteCard(e.target.value);
    } 
    catch(error) {
      console.log(error);
    }
    fetchNameList();
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
          <Heading as="h1" size="lg" ms={3}>Name List</Heading>
        </Box>
        <Container maxW="1080px">
          <Flex flexWrap="wrap" justifyContent="space-between" mt={5} mb={4}>
            <Flex gap={1} flexWrap="wrap">
              <Input width="auto" type="text" ref={bcInputText} placeholder="Barcode" id="bcInput" onChange={e=>setBcInput(e.target.value)} autoComplete="off" autoFocus/>
              <Input width="auto" type="text" ref={nameInputText} placeholder="Name" id="bcInput" onChange={e=>setNameInput(e.target.value)} autoComplete="off"/>
              <Button colorScheme="black" variant="outline" onClick={e=>bcNameInputFunction(e)}>Submit</Button>
            </Flex>
          </Flex> 
            {isLoading ? (
            <Spinner size="xl"/>
            ) : (
            <Box overflow="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Delete</Th>
                    <Th>Barcode</Th>
                    <Th>Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pages.length > 0 && pages[page].map((nl: NameListType, i: number)=>{
                    return (
                      <Tr key={i + 1}>
                        <Td>
                          <Box as="span" color="gray">{page > 0 ? ((i + 1) + (page * 100)) : i + 1}</Box>
                        </Td>
                        <Td> 
                          <Button size="sm" colorScheme="red" onClick={e=>deleteName(e)} value={nl.card}>Delete</Button>
                        </Td>
                        <Td>{nl.card}</Td>
                        <Td>{nl.name}</Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table> 
            </Box>
            )}
          <PageNavigation pages={pages} changePage={changePage}/>
        </Container>
      </Box>
    </>
  )
}

export default NameList;