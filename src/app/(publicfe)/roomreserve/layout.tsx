'use client'

import {useState,useRef} from 'react';
import { useRouter } from 'next/navigation';
import {BsFillSunFill} from 'react-icons/bs';
import {BsFillMoonFill} from 'react-icons/bs';
import {GiHamburgerMenu} from 'react-icons/gi';
import { 
  Box, 
  Flex,
  Button, 
  Heading,
  Link,
  Image,
  ListItem,
  UnorderedList,
  Container,
  SimpleGrid,
  Text,
  useColorMode
} from "@chakra-ui/react";
import { useCustomTheme } from '@/app/hooks/useCustomTheme';
import moment from 'moment';

export default function FrontEndLayout({children}:Readonly<{
  children: React.ReactNode;
}>) {
  const {customSettings,primaryColor,secondaryColor} = useCustomTheme();
  const { colorMode, toggleColorMode } = useColorMode();

  let router = useRouter();

  const [navExpanded,setNavExpanded] = useState(false);
  const mobileNavBtnRef = useRef();
  function expandNav() {
    setNavExpanded(prev=>{
      if(!prev) {
        (mobileNavBtnRef.current as any).ariaExpanded = true;
        return true
      }
      else {
        (mobileNavBtnRef.current as any).ariaExpanded = false;
        return false
      }
    })
  }

  return (
    <Box id="fe-main">
      <Box
        as="header"
        marginLeft="auto"
        marginRight="auto"
        maxWidth="1200px"
        mb={5}
      >
        <Flex 
          alignItems="center" 
          justifyContent="space-between" 
          flexWrap="wrap"
          width="100%"
          px="1rem"
        >
          <Flex 
            p={0} 
            flexDirection="column"
            alignItems="flex-start" 
            justifyContent="flex-start"
            maxW="450px"
            my={3}
          >
            {customSettings?.logo ? (
            <Link href={customSettings?.library_url}>
              <Image 
                src={customSettings?.logo} 
                objectFit="cover" 
                minW="180px"
                maxH="125px"
                alt="Library logo"
              />
            </Link>
            ) : (
            customSettings?.library_url !== null ? 
            <a href={customSettings?.library_url}>
              {/* <Heading 
                as="h1" 
                size="lg" 
                fontSize="2rem"
              >
                {userNameLocation}
              </Heading> */}
            </a> : null
            )}
          </Flex>

          <Flex
            alignItems="flex-start"
            justifyContent={["center","center","flex-end"]}
            flexWrap="wrap"
          >
            <Flex 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              p={5}
            >
              {customSettings?.header_info ? (
              <>
                <Text>
                  {customSettings.header_info.address_one}
                </Text>
                <Text>
                  {customSettings.header_info.address_two}
                </Text>
                <Text fontWeight="bold">
                  {customSettings.header_info.phone}
                </Text>
              </>
              ) : null}
            </Flex>

            <Box>
              {customSettings?.header_info ? (
                <Container>
                  <SimpleGrid columns={[1,1,2]}>
                    <Flex flexDirection="column" px={3} pt={5} pb={[0,0,5]}>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Monday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.monday}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Tuesday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.tuesday}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Wednesday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.wednesday}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Thursday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.thursday}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex flexDirection="column" px={3} pt={[0,0,5]} pb={5}>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Friday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.friday}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Saturday:
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.saturday}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" justifyContent="space-between" gap={2} fontWeight="bold">
                        Sunday
                        <Text as="span" fontWeight="normal">
                          {customSettings.header_info.sunday}
                        </Text>
                      </Flex>
                    </Flex>
                  </SimpleGrid>
                </Container>
              ) : null}
            </Box>
          </Flex>

        </Flex>
        <Button
          ref={mobileNavBtnRef as any}
          w="98%"
          display={["flex","none","none"]}
          justifyContent="flex-start"
          rounded="none"
          mt={3}
          mb={-1}
          mx="auto"
          color="white"
          backgroundColor={primaryColor}
          _hover={{
            backgroundColor: secondaryColor
          }}
          onClick={e=>expandNav()}
          data-toggle="collapse"
          data-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <GiHamburgerMenu/>
          <Text as="span" className="visually-hidden">Toggle Navigation</Text>
        </Button>
        <Box
          as="nav"
          id="navbar"
          role="navigation"
          aria-labelledby="nav-label"
          display={[navExpanded ? "flex" : "none","flex","flex"]}
          width="98%"
          mx="auto"
          rounded="md"
          color="white"
          backgroundColor={primaryColor}
          fontWeight="700"
        >
          <Heading as="h2" id="nav-label" className="visually-hidden">Main navigation</Heading>
          <UnorderedList
            styleType="none"
            display="flex"
            flexDirection={["column","row","row"]}
            alignItems="center" 
            justifyContent="flex-start" 
            flexWrap="wrap"
            w={["100%","auto","auto"]}
            ms={0}
            sx={{
              '& a': {
                lineHeight: "2.5rem",
                display: "block"
              },
              '& li': {
                _hover: {
                  backgroundColor: secondaryColor,
                  a: {
                    color: "white",
                    textDecoration: "none",
                  }
                }
              },
              '& li:first-of-type:hover': {
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px"
              }
            }}
          >
            <ListItem
              px={3}
            >
              <Link
                href={customSettings?.library_url}
              >
                Library Website
              </Link>
            </ListItem>

            {customSettings?.show_event_calendar ? (
            <ListItem
              px={3}
            >
              <Link
                href="/cal"
              >
                Event Calendar
              </Link>
            </ListItem>
            ) : null}

            {customSettings?.show_request_study_room ? (
            <ListItem
              px={3}
            >
              <Link
                href="/roomreserve/studyroom"
              >
                Request a Study Room
              </Link>
            </ListItem>
            ) : null}

            {customSettings?.show_reading_club ? (
            <ListItem
              px={3}
            >
              <Link
                href="/readingclub"
              >
                Reading Club
              </Link>
            </ListItem>
            ) : null}

          </UnorderedList>

          {customSettings?.allow_dark_mode ? (
          <Box 
            marginLeft="auto"
            className="element-and-tooltip"
          >
            <Button 
              bg="transparent"
              onClick={toggleColorMode}
              _hover={{
                bg: secondaryColor
              }}
              aria-describedby="colormode-desc"
              aria-label="color mode"
              aria-pressed={colorMode === "dark" ? true : false}
              role="toggle button"
            >
              {colorMode === 'light' ? <BsFillMoonFill color="white"/> : <BsFillSunFill color="white"/>}
              <Text as="span" className="visually-hidden">Color Mode</Text>
            </Button>
            <Box role="tooltip" id="colormode-desc">
              Toggle light and dark mode
            </Box>
          </Box>
          ) : (
            null
          )}

        </Box>
      </Box>
      {children}
      <Box 
        as="footer" 
        backgroundColor={primaryColor}
        shadow="md"
        py={2}
        fontSize="sm"
        mb="0"
        width="100%"
        position="absolute"
        bottom={0}
        zIndex={-1}
      >
        <Flex
          color="white"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
        >
          <Link 
            href="https://curatorkit.com"
            px={5}
            _hover={{
              textDecoration: "none",
              color: "lightgrey"
            }}
          >
            CuratorKit <Text as="span">{moment(new Date).format("YYYY")}</Text>
          </Link>
          <Text
            px={5}
            borderRight="1px solid"
            borderLeft="1px solid"
          >
            <Link 
              href="mailto:admin@curatorkit.com"
              _hover={{
                textDecoration: "none",
                color: "lightgrey"
              }}
            >
              calendar tech support
            </Link>
          </Text>
          <Text
            px={5}
          >
            <Link 
              href="http://curatorkit.com/wp-content/uploads/2022/12/CuratorKit_Event_Calendar_VPAT_Report-12-2-22.pdf"
              _hover={{
                textDecoration: "none",
                color: "lightgrey"
              }}
            >
              accessibility features
            </Link>
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}