'use client'

import { ReactNode, useState, useTransition, useEffect, useContext } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  BoxProps,
  FlexProps,
  Link,
  Stack,
  useColorMode,
  Button,
  Image,
  useToast,
  Switch,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem
} from '@chakra-ui/react'
import { useRouter, usePathname } from 'next/navigation';
import {
  FiMenu,
  FiLogOut,
} from 'react-icons/fi'
import { FaPlus, FaMoon, FaSun } from "react-icons/fa";
import { MdMeetingRoom } from 'react-icons/md';
import { GoCalendar } from 'react-icons/go';
import { MdSettings } from 'react-icons/md';
import { TbTallymarks } from 'react-icons/tb';
import { BiCustomize, BiBookReader } from 'react-icons/bi';
import { BsCheckAll } from 'react-icons/bs';
import { HiPencilAlt, HiOutlineDesktopComputer } from 'react-icons/hi';
import { VscTools } from 'react-icons/vsc';
import { CgFileDocument } from 'react-icons/cg';
import { postLogout } from '../actions/logout.actions';
import { getUser } from '../actions/mainLayout.actions';
import { User } from '../types/types';
import { AllContext, AllContextProps } from '../context/AllContext';

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const sidebarWidth = "18rem";

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const allContext = useContext(AllContext) as AllContextProps;
  const {tokens} = allContext;

  const pathname = usePathname();
  const [user,setUser] = useState<User | null>(null);
  async function fetchUser() {
    await getUser()
      .then((res)=>{
        if (res.success) {
          setUser(res.data)
        }
        else {
          console.error(res)
        }
      })
      .catch((res)=>{
        console.error(res)
      })
  }
  useEffect(()=>{
    fetchUser()
  },[])

  const [isPending, startTransition] = useTransition();
  async function onLogout() {
    startTransition(()=>{
      postLogout()
        .catch((ex)=>{
          console.error('Logout failed:', ex);
        });
    })
  }

  const toast = useToast();
  const router = useRouter();

  const {colorMode,toggleColorMode} = useColorMode();

  const linkHoverStyles = {
    bg: 'gray.300',
    color: 'white',
    _dark: {
      bg: 'gray.700',
      color: 'white',
    }
  }

  return (
    <Box
      id="sidebar"
      borderRight="1px"
      borderRightColor="gray.200"
      _dark={{
        borderRightColor: "gray.700"
      }}
      w={{ base: 'full', md: sidebarWidth }}      
      overflow="auto"
      pos="fixed"
      h="full"
      display="contents"
      {...rest}>
      <Flex 
        h={20} 
        alignItems="center" 
        // mx="3" 
        justifyContent={{base: 'space-between', md: 'center'}} mb={1}
      >
        <Image 
          src={`/CuratorKitLogo2small_${colorMode}.png`}
          alt="logo"
          maxW="90%" 
          maxH="3rem"
          p={1}
          m={1}
        />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Divider w="80%" alignSelf="center" mb={1} />
      <Box>
        <Flex justify="center">
            {user?.email}
        </Flex>
        <Flex fontSize="xs" fontWeight="200" justify="center">
            {user?.Library?.name}
        </Flex>
        <Flex align="center" justify="center">
          <form action={onLogout}>
            <Box
              as={IconButton}
              icon={<Icon as={FiLogOut} size="xs" mr={4} />}
              isDisabled={isPending}
              isLoading={isPending}
              type="submit"
              size="xs"
              p={0}
              variant="ghost"
              _hover={{
                bg: "none"
              }}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
            >
            </Box>
          </form>
          <Box
            as={IconButton}
            icon={<Icon as={colorMode === 'light' ? FaSun : FaMoon} mr={4} />}
            p={0}
            size="xs"
            variant="ghost"
            _hover={{
              bg: "none"
            }}
            onClick={toggleColorMode} 
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
          </Box>
        </Flex>
      </Box>
      <Divider w="80%" alignSelf="center" mt={1} />
      <Stack 
        justify="space-between" 
        h={{base: "65vh", md: "100%"}}
      >
        <Flex
          align="center"
          flexDirection="column"
          gap={3}
          width="auto"
          pt={0}
          mx={1}
          borderRadius="lg"
          sx={{
            '& *': {
              // fontSize: 16
            },
            '&:hover': {
              background: 'transparent',
              color: 'inherit'
            },
            '& button:focus': {
              boxShadow: 'none',
              borderRadius: '5px'
            },
            '.chakra-accordion__icon': {
              visibility: "hidden"
            }
          }}
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'cyan.400',
            color: 'white',
          }}
          {...rest}
        >
          <Accordion 
            width="100%"
            // defaultIndex={[0]} 
            allowToggle
            // allowMultiple
            // reduceMotion="true"
          >
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}>
                    <Icon as={BiCustomize} fontSize="2xl"/> Customize/Data
                  </Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2} textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link 
                      href="/customizefe" 
                      onClick={onClose} 
                    >
                        Customize Front-end
                      </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link 
                      href="/namelist" 
                      onClick={onClose} 
                    >
                        Add Card
                    </Link>                      
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={GoCalendar} fontSize="2xl"/> Event Calendar</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2} textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link 
                      href="/eventcalendar" 
                      onClick={onClose} 
                    >
                      Event Calendar
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link 
                      href="/formbuilder" 
                      onClick={onClose} 
                    >
                        Form Builder
                      </Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={MdMeetingRoom} fontSize="2xl"/>Room Reserve</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2} textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/studyrooms" onClick={onClose}>Study Rooms</Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/reserveformbuilder" onClick={onClose} >Form Builder</Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={HiPencilAlt} fontSize="2xl"/>Room Sign-ins</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2}  textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/roomsigninlists" onClick={onClose}>Room Sign-in</Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/roomsigninhistory" onClick={onClose}>History</Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={HiOutlineDesktopComputer} fontSize="2xl"/>Computer Sign-ins</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2}  textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/compsignin" onClick={onClose}>Computer Sign-in</Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/compsigninhistory" onClick={onClose}>History</Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={BsCheckAll} fontSize="2xl"/>In-house Checkout</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2}  textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/inhousecheckout" onClick={onClose}>In-house Checkout</Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/inhousecheckouthistory" onClick={onClose}>History</Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={TbTallymarks} fontSize="2xl"/> Reference Count</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2}  textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/refcount" onClick={onClose}>
                      Reference Count
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/refcounthistory" onClick={onClose}>
                      History
                    </Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem 
              border={0}
              rounded="md"
              m={2}
              py={.75}
              _hover={{
                '.chakra-accordion__icon': {
                  visibility: "visible"
                }
              }}
            >
              <h2>
                <AccordionButton display="flex" justifyContent="space-between" gap={1}>
                  <Flex alignItems="center" gap={5}><Icon as={CgFileDocument} fontSize="2xl"/> Docs/Support</Flex>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel color="gray" mt={-1} pb={0}>
                <List spacing={2} textAlign="left" pl={0} mb={0}>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/eventcalendar" onClick={onClose}>
                      Event Calendar
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/roomsignins" onClick={onClose}>
                      Room Sign Ins
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/computersignins" onClick={onClose}>
                      Computer Sign Ins
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/inhousecheckout" onClick={onClose}>
                      In-house Checkout
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/referencecount" onClick={onClose}>
                      Reference Count
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/docs/extratools" onClick={onClose}>
                      Extra Tools
                    </Link>
                  </ListItem>
                  <ListItem ps="2.8rem" fontSize="sm">
                    <Link href="/support" onClick={onClose}>
                      Support
                    </Link>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>

      </Stack>
    </Box>
  )
}

interface MobileProps extends FlexProps {
    onOpen: () => void
}

export const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const {colorMode} = useColorMode();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="5rem"
      alignItems="center"
      borderBottomWidth="1px"
      justifyContent="space-between"
      {...rest}>
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Image 
        src={`/CuratorKitLogo2small_${colorMode}.png`}
        alt="logo"
        maxW="90%" 
        maxH="3rem"
      />
    </Flex>
  )
}

export const MainStack = ({showSidebar, children, ...rest}: {showSidebar: boolean, children: ReactNode}) => {
  return (
    <Stack 
      as="main" 
      ml={{ base: 0, md: showSidebar ? sidebarWidth : 0 }} 
      px={10}
      h="full"
      // overflow="auto"
    >
        {children}
    </Stack>
  )
}