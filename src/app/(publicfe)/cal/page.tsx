'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import JSONSchemaForm from "@rjsf/core";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {GoLocation} from 'react-icons/go';
import {AiOutlineClockCircle} from 'react-icons/ai';
import ICalendarLink from "react-icalendar-link";
import {BsApple} from 'react-icons/bs';
import {FcGoogle} from 'react-icons/fc';
import {FaSearch} from 'react-icons/fa';
import {Accessibility, IAccessibilityOptions} from 'accessibility';
import {CgChevronUpO} from 'react-icons/cg';
import { useCustomTheme } from '@/app/hooks/useCustomTheme';
import { 
  Box, 
  Flex,
  Button, 
  IconButton,
  Divider, 
  Container, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Link,
  Icon,
  Select,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Tabs, TabList, Tab
} from "@chakra-ui/react"
import DOMPurify from 'dompurify';
import { getLibraryNameFromSubdomain } from '@/app/actions/libray.actions';
import { getFeEvents, getFeCalendarMonths, getFeCalendarSearch, getFeForm, postRegForm, postEmailReminder } from '@/app/actions/frontendcalendar/frontendcalendar.actions';
import { BigCalendarEventsType, EventDataType, EventTypeType } from '@/app/types/types';
import validator from '@rjsf/validator-ajv8';

export default function FrontEndCalendar() {
  const router = useRouter();

  const {customSettings,primaryColor,secondaryColor} = useCustomTheme();

  const initialRef = useRef(null)

  const [events, setEvents] = useState<EventDataType[] | []>([]);
  const [inputDate, setInputDate] = useState(moment.utc(new Date().toISOString()).local().format('YYYY-MM-DD'));

  const [bigCalendarView,setBigCalendarView] = useState(false)
  const [bigCalendarEvents,setBigCalendarEvents] = useState<BigCalendarEventsType[] | []>([])
  const localizer = momentLocalizer(moment)

  const [isLoading,setIsLoading] = useState(false);
  const [eventTypes,setEventTypes] = useState<EventTypeType[] | []>([]);
  const [calTypesId,setCalTypesId] = useState("All");
  const [libraryName,setLibraryName] = useState("");
  const [libraryTimezone,setLibraryTimezone] = useState(null);

  const accessibilityOptions: IAccessibilityOptions = {
    icon: {
      img: 'accessibility',
      // position: {
      //   bottom: {
      //     size: 15,
      //     units: '%'
      //   },
      //   right: {
      //     size: .75,
      //     units: '%'
      //   }
      // }
    },
    // hotkeys: {
    //   enable: true
    // },
    session: {
      persistent: false
    },
    language: {
      textToSpeechLang: 'en-US',
      speechToTextLang: 'en-US'
    },
    iframeModals: [{
        iframeUrl: 'https://curatorkit.com/event-calendar-info',
        buttonText: 'Event Calendar info',
        icon: 'info'
      }]
  }

  useEffect(()=>{
    const subdomain = window.location.host.split(".")[0];
    getLibraryNameFromSubdomain(subdomain)
      .then((res)=>{
        if (res.success) {
          setLibraryName(res.data)
          document.title = res.data + " Event Calendar";
        }
      })

    //remove aria-expanded from accordion buttons
    const accordionButtons = document.querySelectorAll("button[id*='accordion-button-']")
    accordionButtons.forEach((accordionButton)=>{
      setTimeout(()=>{
        accordionButton.removeAttribute("aria-expanded")
      },100)
    })
    accordionButtons.forEach((accordionButton)=>{
      (accordionButton as HTMLElement).onclick = function(){
        setTimeout(()=>{
          accordionButton.removeAttribute("aria-expanded")
        },100)
      }
    },[])

    //display scrolltotopbutton
    let scrollToTopButton = document.getElementById("scrollToTopButton");
    window.onscroll = (function() {
      if (scrollToTopButton) {
        if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
          scrollToTopButton.style.display = "inline-block";
        }
        else {
          scrollToTopButton.style.display = "none";
        }
      }
    })

    //give calendar aria tag/attribute
    let calendar = document.querySelector('.react-calendar__viewContainer')
    if (calendar) {
      calendar.setAttribute("aria-label","calendar")
    }
  })

  // const [monthYear,setMonthYear] = useState()
  useEffect(()=>{
    new Accessibility(accessibilityOptions);

    const newDiv = document.createElement("div")
    const monthLabel: HTMLElement | null = document.querySelector('.react-calendar__navigation__label');

    if (newDiv && monthLabel){
      newDiv.innerText = monthLabel?.innerText;
      newDiv.style.display = "flex";
      newDiv.style.alignItems = "center";
      monthLabel!.parentNode!.replaceChild(newDiv,monthLabel)
      const navigationBar: HTMLElement | null = document.querySelector('.react-calendar__navigation');
      navigationBar!.style.justifyContent = "space-between"
    }
    
    //add tooltips to calendar navigation
    const prev: HTMLElement | null = document.querySelector('.react-calendar__navigation__prev-button');
    const calendarTooltip: HTMLElement | null = document.getElementById("calendar-description");
    const prev2: HTMLElement | null = document.querySelector('.react-calendar__navigation__prev2-button');
    const next: HTMLElement | null = document.querySelector('.react-calendar__navigation__next-button');
    const next2: HTMLElement | null = document.querySelector('.react-calendar__navigation__next2-button');
    if (prev && prev2 && calendarTooltip && next && next2) {
      prev2.setAttribute("aria-describedby","calendar-description")
      prev2.innerHTML += "<span class='visually-hidden'>Jump back one year</span>"
      prev2.onmouseover = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump back one year"
      }
      prev2.onmouseleave = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      prev2.onfocus = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump back one year"
      }
      prev2.onblur = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      prev2.addEventListener("click",()=>{
        newDiv.innerText = moment(newDiv.innerText).subtract(1,"years").format('MMMM YYYY')
      })
      prev.setAttribute("aria-describedby","calendar-description")
      prev.innerHTML += "<span class='visually-hidden'>Jump back one month</span>"
      prev.onmouseover = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump back one month"
      }
      prev.onmouseleave = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      prev.onfocus = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump back one month"
      }
      prev.onblur = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      prev.addEventListener("click",()=>{
        newDiv.innerText = moment(newDiv.innerText).subtract(1,"months").format('MMMM YYYY')
      })
      next.setAttribute("aria-describedby","calendar-description")
      next.innerHTML += "<span class='visually-hidden'>Jump forward one month</span>"
      next.onmouseover = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump forward one month"
      }
      next.onmouseleave = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      next.onfocus = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump forward one month"
      }
      next.onblur = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      next.addEventListener("click",()=>{
        newDiv.innerText = moment(newDiv.innerText).add(1,"month").format('MMMM YYYY')
      })
      next2.setAttribute("aria-describedby","calendar-description")
      next2.innerHTML += "<span class='visually-hidden'>Jump forward one year</span>"
      next2.onmouseover = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump forward one year"
      }
      next2.onmouseleave = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      next2.onfocus = function(){
        calendarTooltip.style.display = "block"
        calendarTooltip.innerText = "Jump forward one year"
      }
      next2.onblur = function(){
        calendarTooltip.style.display = "none"
        calendarTooltip.innerText = ""
      }
      next2.addEventListener("click",()=>{
        newDiv.innerText = moment(newDiv.innerText).add(1,"years").format('MMMM YYYY')
      })
    }
  },[])
  
  function handleDate(e: any) {
    setInputDate(e.toISOString().split("T")[0]);
  }
  
  const fetchEvents = useCallback(async () => {
    const subdomain = window.location.host.split(".")[0];
    setIsLoading(true);
    await getFeEvents(subdomain,inputDate,calTypesId)
      .then((response) => {
        let r = response.data;
        let bigCalendarEvents = r.bigCalendarEvents
        let eventsSorted = r.events.sort((a: any,b: any)=>{
          return (moment(new Date(a.eventstart)) as any) - (moment(new Date(b.eventstart)) as any)
        })
        let eventsLocalized = eventsSorted.map((e: any)=>{
          return {
            ...e, 
            displaystart: moment.utc(e.displaystart, "MM-DD-YYYY").local().format('MM/DD/YY hh:mm:ss A'),
            displayend: moment.utc(e.displayend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
            reservestart: moment.utc(e.reservestart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
            reserveend: moment.utc(e.reserveend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
            eventstart: moment.utc(e.eventstart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
            eventend: moment.utc(e.eventend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A')
          }
        }).filter((e: any)=>moment.utc(e.eventstart, "MM-DD-YYYY hh:mm:ss A").local() >= moment(inputDate))
        setEvents(eventsLocalized);
        setEventTypes(r.eventTypes);
        // window.location = `${window.location.toString().split("#")[0]}#${inputDate}`
        const bigCalendarEventsLocalized = bigCalendarEvents.map((e: any)=>{
          return {
            ...e, 
            start: moment.utc(e.start).local().format('MM/DD/YY hh:mm:ss A'),
            end: moment.utc(e.end).local().format('MM/DD/YY hh:mm:ss A')
          }
        })
        setBigCalendarEvents(bigCalendarEventsLocalized)
        setLibraryTimezone(r.timezone)
        setIsLoading(false)
        dateFunction();

        //add role="row" to react calendar table
        const reactCalendarMonthViewDays = document.querySelector(".react-calendar__month-view__days")
        if (reactCalendarMonthViewDays) {
          reactCalendarMonthViewDays.setAttribute("role","row");
        }
        // //add role="gridcell" to react calendar table cells
        // const reactCalendarTiles = document.querySelectorAll(".react-calendar__tile");
        // reactCalendarTiles.forEach((tile)=>{
        //   tile.setAttribute("role","gridcell");
        // })
        //add aria-selected to selected date
        const dateSelected: HTMLElement | null = document.querySelector(".react-calendar__tile--active");
        if (dateSelected && reactCalendarMonthViewDays) {
          dateSelected.ariaSelected = "true" ;
        }

        //remove role region from accordion panels
        const regionRoles = document.querySelectorAll("[role='region']");
        regionRoles.forEach((regionRole)=>{
        regionRole.removeAttribute("role")
        })
      })
      .catch((res)=>{
        console.error(res);
        setIsLoading(false)
      })
  },[inputDate,calTypesId])
  useEffect(()=>{
    fetchEvents()
  },[fetchEvents])

  async function handleMonth(e: any) {
    const inputMonth = moment(e).format("YYYY-MM")
    const subdomain = window.location.host.split(".")[0];
    setIsLoading(true)
    try {
      await getFeCalendarMonths(subdomain,inputMonth,calTypesId)
        .then((response) => {
          let eventsSorted = response.data.sort((a: any,b: any)=>{
            return (moment(new Date(a.eventstart)) as any) - (moment(new Date(b.eventstart)) as any)
          })
          let eventsLocalized = eventsSorted.map((e: any)=>{
            return {
              ...e, 
              displaystart: moment.utc(e.displaystart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
              displayend: moment.utc(e.displayend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
              reservestart: moment.utc(e.reservestart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
              reserveend: moment.utc(e.reserveend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
              eventstart: moment.utc(e.eventstart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
              eventend: moment.utc(e.eventend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A')
            }
          })
          setEvents(eventsLocalized);
          setIsLoading(false)
      })
    } catch(error) {
        console.log(error);
    }
  }

  const searchTermRef = useRef();
  async function handleSearch(e: any) {
    e.preventDefault()
    const searchTerm = (searchTermRef.current as any).value
    const subdomain = window.location.host.split(".")[0];
    if (searchTerm) {
      setIsLoading(true)
      await getFeCalendarSearch(subdomain,searchTerm,calTypesId)
        .then((response) => {
          if (response.success) {
            const searchResults = response.data;
            let eventsSorted = searchResults.sort((a: any,b: any)=>{
              return (moment(new Date(a.eventstart)) as any) - (moment(new Date(b.eventstart)) as any)
            })
            let eventsLocalized = eventsSorted.map((e: any)=>{
              return {
                ...e, 
                displaystart: moment.utc(e.displaystart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
                displayend: moment.utc(e.displayend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
                reservestart: moment.utc(e.reservestart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
                reserveend: moment.utc(e.reserveend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
                eventstart: moment.utc(e.eventstart, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A'),
                eventend: moment.utc(e.eventend, "MM-DD-YYYY hh:mm:ss A").local().format('MM/DD/YY hh:mm:ss A')
              }
            })
            setEvents(eventsLocalized);
            (searchTermRef.current as any).value = "";
          }
          else {
            console.error(response);
          }
      })
      .catch((res)=>{
        console.error(res)
      })
      setIsLoading(false)
    }
    else {
      return null
    }
  }

  type SetFormType = {
    formid: string; 
    formschema: string;
    formuischema: string | null;
    formeventtypename: string; 
    formeventtypeid: string;
  }

  const [form,setForm] = useState<SetFormType | null>(null);
  const [openFormModal,setOpenFormModal] = useState(false)
  const openRegForm = useCallback(async (e: any) => {
    const formId = e.target.dataset.formid
    const subdomain = window.location.host.split(".")[0];
    try {
      await getFeForm(subdomain,formId)
        .then((response) => {
          setForm({
            formid: formId, 
            formschema: response.data.form_schema, 
            formuischema: response.data.formuischema ? response.data.form_ui_schema : null,
            formeventtypename: e.target.dataset.eventtypename, 
            formeventtypeid: e.target.dataset.eventtypeid
          });
          setOpenFormModal(true);

          const submitFormButton: HTMLElement | null = document.querySelector('button[type="submit"].btn-info');
          if (submitFormButton) {
            submitFormButton.setAttribute("aria-label","submit");
            if (submitFormButton.parentNode) {
              (submitFormButton.parentNode as HTMLElement).style.display = "flex";
              (submitFormButton.parentNode as HTMLElement).style.justifyContent = "flex-end";
            }
          }
        })
    } catch(error) {
        console.log(error);
    }
  },[])

  const closeFormModal = () => {
    setOpenFormModal(false)
    setRegFormErrorMsg("")
    setForm(null)
  }

  const [regFormErrorMsg,setRegFormErrorMsg] = useState("");
  const regFormIdRef = useRef();
  const regFormTypeNameRef = useRef();
  const regFormTypeIdRef = useRef();
  const submitRegForm = useCallback(async (e: any) => {
    const subdomain = window.location.host.split(".")[0];
    await postRegForm(subdomain, e,(regFormIdRef.current as any).value, (regFormTypeNameRef.current as any).value, (regFormTypeIdRef.current as any).value)
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
        }
      })
      .catch((res)=>{
        console.error(res)
      })
  },[fetchEvents])

  async function goToBigCalendarEvent(e: HTMLElement) {
    const programId = e.id;
    router.push(`${window.location}/${programId}`);
  }

  const [openEmailModal,setOpenEmailModal] = useState(false);
  const [emailReminderEventId,setEmailReminderEventId] = useState(null);
  function emailModalOpen(e: any) {
    e.preventDefault()
    setEmailReminderEventId(e.target.dataset.eventid)
    setOpenEmailModal(true)
  }

  const [emailReminderError, setEmailReminderError] = useState("");
  const emailRef = useRef();
  async function setEmailReminder(e: any) {
    e.preventDefault();
    const emailAddress = (emailRef.current as any).value;
    if (emailAddress !== "") {
      await postEmailReminder(emailAddress,e.target.dataset.eventid)
        .then((response)=>{
          if (response.success) {
            window.alert("Email Reminder set")
            closeEmailModal();
            fetchEvents();
          }
          else {
            setEmailReminderError(response.message);
            console.error(response)
          }
        })
        .catch((res)=>{
          setEmailReminderError(res.message)
          console.error(res)
        })
    }
    else {
      setEmailReminderError("Please enter an email address")
      document.getElementById("email")!.focus()
    }
  }
  function closeEmailModal() {
    setEmailReminderEventId(null)
    setEmailReminderError("")
    setOpenEmailModal(false);
  }

  function setBigCalEventBackgrounds() {
    setTimeout(()=>{
      let eventRows: NodeListOf<HTMLElement> = document.querySelectorAll(".rbc-event")
      eventRows.forEach((eventRow)=>{
        let event: HTMLElement | null = eventRow.querySelector(".rbc-event-content")
        for (let bigCalEvent of bigCalendarEvents) {
          if (bigCalEvent.title === event!.innerText) {
            let eventTypeColors = JSON.parse(bigCalEvent.typeColor);
            eventRow.style.backgroundColor = eventTypeColors?.rgb;
          }
        }
      })
    },250)
  }

  function bigCalView() {
    setBigCalendarView(true)
    setBigCalEventBackgrounds()
  }

  function dateFunction() {
    document.getElementById("top-date")?.focus();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  function goToEvent(e: any, transid: string){
    e.preventDefault();
    router.push(`/cal/${transid}`)
  }

  function topFunction() {
    document.getElementById("skip-nav")?.focus();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  // DOMPurify.addHook('afterSanitizeAttributes', function(node) {
  //   node.setAttribute('target','_blank');
  //   node.setAttribute('rel','noopener');
  //   // node.setAttribute('rel','noreferrer');
  // })

  return (
    <>
      <Container 
        maxW="1200px" 
        pb={20}
        as="main"
      >
        <a id="skip-nav" tabIndex={-1} className="visually-hidden">Main content</a>
        {customSettings?.big_calendar_view === true ? (
        <Tabs
          variant="enclosed"
        >
          <TabList>
            <Tab
              onClick={e=>setBigCalendarView(false)}
              sx={{
                '&:focus': {
                  boxShadow: `0 0 0 0.25rem ${primaryColor?.replace(')', ', 0.45)').replace('rgb', 'rgba')}`,
                  backgroundColor: `${primaryColor?.replace(')', ', 0.15)').replace('rgb', 'rgba')}`
                },
                '&[aria-selected=true]': {
                  color: `${primaryColor}`
                }
              }}
            >
              Regular View
            </Tab>
            <Tab
              onClick={()=>bigCalView()}
              aria-label="Large view"
              sx={{
                '&:focus': {
                  boxShadow: `0 0 0 0.25rem ${primaryColor?.replace(')', ', 0.45)').replace('rgb', 'rgba')}`,
                  backgroundColor: `${primaryColor?.replace(')', ', 0.15)').replace('rgb', 'rgba')}`
                },
                '&[aria-selected=true]': {
                  color: `${primaryColor}`
                }
              }}
            >
              Large View
            </Tab>
          </TabList>
        </Tabs>
        ) : (
        <Box
          borderBottom="1px"
          borderColor="inherit"
        >
        </Box>
        )}
        {bigCalendarView === false ? (
        <Flex 
          flexDirection="column"
          borderLeft="1px"
          borderRight="1px"
          borderBottom="1px"
          borderColor="inherit"
          p={3}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap="5"
          >
            <Flex 
              justifyContent="flex-start"
              flexDirection="column"
              gap="4"
              flex="0 1 30%"
              mb="3"
              bg="#f7f7f7"
              p={3}
              rounded="md"
              height="fit-content"
              _dark={{
                bg: "whiteAlpha.200"
              }}
            > 
              <Box id="date-picker" tabIndex={-1}></Box>
              <Box
                as={Calendar} 
                bg="white"
                boxShadow="md"
                borderColor="inherit"
                rounded="md"
                color="black"
                aria-label="calendar"
                _dark={{
                  bg: "transparent",
                  color: "white"
                }}
                sx={{
                  '& .react-calendar__tile': {
                    borderRadius: '5px'
                  },
                  '& .react-calendar__tile--now': {
                    backgroundColor: secondaryColor?.replace(')', ', 0.1)').replace('rgb', 'rgba')
                  },
                  '& .react-calendar__tile--active, .react-calendar__tile--active:focus': {
                    background: primaryColor,
                    boxShadow: '1px 1px 1px grey'
                  },
                  '& .react-calendar__tile--active.react-calendar__month-view__days__day--weekend': {
                    color: 'white'
                  },
                  '& .react-calendar__tile--active:hover': {
                    backgroundColor: primaryColor?.replace(')', ', 0.75)').replace('rgb', 'rgba')
                  },
                  '& .react-calendar__month-view__days__day--weekend': {
                    color: secondaryColor
                  }
                }}
                width="auto"
                calendarType="gregory"
                prevAriaLabel="jump back one month"
                prev2AriaLabel="jump back one year"
                nextAriaLabel="jump forward one month"
                next2AriaLabel="jump forward one year"
                navigationAriaLabel="month and year"
                onClickDay={(v: any, e: any) => handleDate(v)}
                onClickMonth={(v: any, e: any) => handleMonth(v)}
                onActiveStartDateChange={(action: any)=>{
                  document.getElementById("calendar-alert")!.innerText = `New view is ${moment(action.activeStartDate).format('MMMM YYYY')}`
                }}
              />
              <Text 
                id="calendar-description"
                role="tooltip"
                bg="rgba(0,0,0,.75)"
                borderRadius="5px"
                p={1}
                color="white"
                display="none"
              >
              </Text>
              <Box id="calendar-alert" role="alert" aria-live="assertive" className="visually-hidden"></Box>
              <Flex alignItems="center" gap="2">
                <Input 
                  type="search"
                  size="md"
                  width="100%"
                  bg="white"
                  ref={searchTermRef as any}
                  onKeyDown={e=>e.key==='Enter' ? handleSearch(e) : null}
                  aria-label="enter search term"
                  borderColor="black"
                  _hover={{
                    borderColor: "black"
                  }}
                  _dark={{
                    bg: "transparent",
                    borderColor: "white"
                  }}
                  autoComplete="on"
                />
                <Box className="element-and-tooltip">
                  <IconButton
                    color="white"
                    type="submit"
                    backgroundColor={primaryColor}
                    aria-label="Search events"
                    aria-describedby="search-button-desc"
                    icon={<FaSearch/>}
                    onClick={e=>handleSearch(e)}
                    me="0"
                    _hover={{
                      backgroundColor: secondaryColor,
                      // border: "1px solid black",
                      // color: "black"
                    }}
                  >
                    <Text as="span" className="visually-hidden">Search button</Text>
                  </IconButton>
                  <Box role="tooltip" id="search-button-desc">
                    Search entered input
                  </Box>
                </Box>
              </Flex>
              <Select 
                variant="outline"
                size="md"
                me="2"
                bg="white"
                width="100%"
                onChange={e=>setCalTypesId(e.target.value)}
                aria-label="select event type"
                borderColor="black"
                _hover={{
                  borderColor: "black"
                }}
                _dark={{
                  bg: "transparent",
                  borderColor: "white"
                }}
              >
                <option 
                  className="dropdown-item" 
                  value="All"
                  aria-label="all types"
                >
                  All Types
                </option>
                {eventTypes?.length >= 1 && eventTypes.map((type,i)=>{
                  return (
                    <option 
                      key={i} 
                      style={{color: type.color?.rgb}} 
                      value={type['id']}
                      aria-label={type.name}
                    >
                      {type.name}
                    </option>
                  )
                })}
              </Select>
            </Flex>
            <Flex 
              flexDirection="column"
              flex="0 1 70%"
              bg="#f7f7f7"
              p={3}
              rounded="md"
              height="fit-content"
              maxWidth={["100%","100%","70%"]}
              _dark={{
                bg: "whiteAlpha.200"
              }}
            >
              <div id="top-date" tabIndex={-1} className="visually-hidden">Top date</div>
              {isLoading !== true ? events.map((event,i)=>{
                return (
                  <Box key={i}>

                    {i !== 0 && (
                      moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format('MMM D, YYYY') !== moment(events[i - 1].eventstart, "MM-DD-YYYY hh:mm:ss A").format('MMM D, YYYY') ? (
                        <Divider mt={5}/>
                      ) : null)}

                    <Box 
                      key={i} 
                      id={moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format('YYYY-MM-DD')}
                    >
                      {i === 0 && (
                        <Heading 
                          as="h2"
                          size="lg"
                          mt="1"
                          mb="2"
                          aria-label={moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format('MMM D, YYYY')}
                        >
                          {moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format('ddd, MMM D, YYYY')}
                        </Heading>
                      )}

                      {i !== 0 && (
                        moment(events[i].eventstart, "MM-DD-YYYY hh:mm:ss A").format('MMM D, YYYY') !== moment(events[i - 1]["eventstart"], "MM-DD-YYYY hh:mm:ss A").format('MMM D, YYYY') ? (
                          <>
                            <Heading 
                              as="h2"
                              size="lg"
                              mt="2"
                              mb="2"
                            >
                            {moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format('ddd, MMM D, YYYY')} 
                            </Heading>
                          </>
                        ): ""
                      )}
                      <Accordion 
                        defaultIndex={customSettings?.keep_accordions_open ? 0 : [i + 1]} 
                        aria-label="accordion"
                        allowMultiple
                      >
                        <AccordionItem 
                          borderRadius="md"
                          minHeight="125px"
                          pt="none"
                          pb="2"
                          // px="2"
                          mb={1}
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignContent="center"
                          boxShadow="md"
                          minH="none"
                          borderRightWidth="1px"
                          borderRightColor="inherit"
                          borderLeft="5px solid"
                          borderLeftColor={(event.eventTypeColor ? JSON.parse(event.eventTypeColor).rgb : "gray")}
                          backgroundColor="white"
                          _dark={{
                            backgroundColor: "transparent",
                            color: "white"
                          }}
                          sx={{
                            '.chakra-accordion__icon': {
                              display: customSettings?.keep_accordions_open ? 'none' : "box"
                            }
                          }}
                        >
                          <AccordionButton 
                            borderRadius="md"
                            _focus={{
                              boxShadow: `0 0 0 0.25rem ${primaryColor.replace(')', ', 0.45)').replace('rgb', 'rgba')}`,
                              backgroundColor: `${primaryColor.replace(')', ', 0.15)').replace('rgb', 'rgba')}`
                            }}
                          >
                            <Box w="100%">
                              <Flex 
                                width="100%"
                                flexWrap="wrap"
                                alignItems="center"
                                justifyContent="flex-start"
                                borderBottom="1px"
                                borderColor="inherit"
                              >
                                <Flex 
                                  flex="1 0 0%" 
                                  alignItems="center"
                                  justifyContent="space-between"
                                  flexWrap="wrap"
                                  gap={[0,1,2]}
                                  // mb={2}
                                >
                                  <Flex>
                                  {event.eventTypeName ? (
                                    <Text 
                                      color="#727272"
                                    >
                                      {event.eventTypeName}
                                    </Text>
                                  ) : null}
                                  </Flex>

                                  <Flex gap={[1,3,3]} flexWrap="wrap">
                                    <Flex alignItems="center" gap={[0,0,1]}>
                                      <Icon as={AiOutlineClockCircle} color="#727272" maxH="15px" mb={0}/>
                                      <Flex>
                                        <Text 
                                          color="#727272"
                                        >
                                        {moment(event.eventstart, "MM-DD-YYYY hh:mm:ss A").format("h:mma")}
                                        </Text>
                                      </Flex>
                                      - 
                                      <Flex>
                                        <Text 
                                          color="#727272"
                                        >
                                          {moment(event.eventend, "MM-DD-YYYY hh:mm:ss A").format("h:mma")}
                                        </Text>
                                      </Flex>
                                    </Flex>

                                    <Flex alignItems="center" gap={[0,0,1]}>
                                    {event.roomName && 
                                      event.roomName !== "None" &&
                                      event.showroom ? (
                                      <>
                                        <Icon as={GoLocation} color="#727272" maxH="15px" mb={0}/>
                                        <Flex>
                                          <Text 
                                            color="#727272" 
                                            lineHeight={[1,1,1.5]}
                                          >
                                            {event.roomName}
                                          </Text>
                                        </Flex>
                                      </>
                                    ) : null}
                                    </Flex>
                                  </Flex>

                                </Flex>
                              </Flex>
                              <Flex 
                                flex="1 0 0%" 
                                mt={2}
                                // mb={2}
                                alignItems="center"
                                justifyContent="flex-start"
                                gap={2}
                              >
                                <Link href={`/cal/${event.transid}`} onClick={e=>goToEvent(e, event.transid.toString())}>
                                  <Heading 
                                    as="h3"
                                    size="md" 
                                    fontWeight="bold"
                                  >
                                    {event.eventname}
                                  </Heading>
                                </Link>
                              </Flex>
                            </Box>
                            <AccordionIcon/>
                          </AccordionButton>
                          <AccordionPanel 
                            px={2}
                            pb={0}
                          >
                            <Box>
                              {event.description ? (
                              <Flex 
                                justifyContent="center"
                                width="100%"
                                mt="0"
                                mb="2"
                              >
                                <Flex
                                  minHeight='40px'
                                  // maxWidth='900px'
                                  flexDirection='column'
                                  width='100%'
                                  overflow='hidden'
                                  mx={2}
                                  p={3}
                                  border="1px solid"
                                  borderColor="inherit"
                                  dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(event.description)}}
                                  aria-label="event description"
                                  tabIndex={0}
                                  sx={{
                                    a: {
                                      color: "blue",
                                      textDecoration: "underline"
                                    },
                                    "img": {
                                      "margin": ".5rem"
                                    }
                                  }}
                                >
                                </Flex>
                              </Flex>
                              ): null}
                            </Box>
                            <Flex 
                              alignItems="center"
                              justifyContent={["center","space-between","space-between"]}
                              flexWrap="wrap"
                            >
                              <Flex alignItems="center" flexWrap="wrap" gap={1} justifyContent="center" ms={2}>
                                <Button 
                                  border="1px"
                                  bg="transparent"
                                  size="sm"
                                  borderColor="inherit" 
                                  color="black"
                                  data-eventid={event.transid}
                                  onClick={e=>emailModalOpen(e)}
                                  aria-label="email reminder"
                                >
                                  Email Reminder
                                </Button>
                                <a target="_blank" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=${libraryTimezone}&location=${libraryName}&dates=${new Date(event.eventstart).toISOString().replace(/[\W_]+/g,"")}/${new Date(event.eventend).toISOString().replace(/[\W_]+/g,"")}&text=${event.eventname}&trp=false`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    aria-label="add to google calendar"
                                    tabIndex={-1}
                                  >
                                    <Icon as={FcGoogle}/> GCal
                                  </Button>
                                </a>
                                <Box as={ICalendarLink}
                                  event={{
                                    title: event.eventname,
                                    description: "",
                                    startTime: moment(new Date(event.eventstart)).toISOString(true),
                                    endTime: moment(new Date(event.eventend)).toISOString(true),
                                    location: libraryName,
                                    attendees: []
                                  }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    aria-label="add to icalendar"
                                    tabIndex={-1}
                                  >
                                    <Icon as={BsApple} mb={1}/>ICal
                                  </Button>
                                </Box>
                              </Flex>
                              <Flex 
                                flex="0 0 auto"
                                alignItems="center"
                                justifyContent="flex-end"
                                flexWrap="wrap"
                                gap="2"
                                m="2"
                              >
                                <Text>
                                  {event.attendees - event.numberRegistered > 1 ? (
                                  event.attendees - event.numberRegistered + " spots left"
                                  ) : event.attendees - event.numberRegistered === 1 ? (
                                    "1 spot left"
                                  ) : ""}
                                </Text>
                                <Flex flexWrap="wrap">
                                  {event.form_id !== null ? (
                                  <Button 
                                    backgroundColor={primaryColor}
                                    color="white"
                                    size="sm"
                                    data-formid={event.form_id}
                                    data-eventtypename={event.eventTypeName}
                                    data-eventtypeid={event.eventtype}
                                    onClick={openRegForm}
                                    aria-label="register for event"
                                    _hover={{
                                      backgroundColor: secondaryColor
                                    }}
                                  >
                                    {event.registrationType}
                                  </Button>
                                  ) : (
                                  event.numberRegistered < 1 ? (
                                    null
                                  ):(
                                    <Text 
                                      as="i"
                                      aria-label="event registration"
                                      me={1}
                                    >
                                      {event.registrationType}
                                    </Text>
                                  )
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                        <Button
                          bgColor="transparent"
                          position="absolute"
                          left="-1000"
                          overflow="hidden"
                          variant="outline"
                          colorScheme="black"
                          _focus={{
                            position: "relative",
                            top: "0",
                            left: "0",
                            _hover: {
                              bgColor: "lightgrey"
                            }
                          }}
                          tabIndex={0}
                          aria-label="back to top"
                          onClick={e=>topFunction()}
                          onKeyDown={e=>e.key==='Enter' ? topFunction() : null}
                        >
                          Back to top?
                        </Button>
                      </Accordion>
                    </Box>
                  </Box>
                )
              })
              : (
              <Flex 
                justifyContent="center"
              >
                <Spinner size="xl" />
              </Flex>
              )}
            </Flex>
          </Flex>
          <Box 
            as="span" 
            position="fixed"
            bottom="6%"
            right="0.75%"
            display="none"
            id="scrollToTopButton"
          >
            <Button 
              color="black"
              p={0}
              height="3.25rem"
              width="3.25rem"
              bgColor="white"
              fontSize="3.25rem"
              tabIndex={0}
              borderRadius="full"
              aria-label="back to top"
              aria-describedby="scroll-to-top-button"
              _hover={{
                color: "black"
              }}
              onClick={()=>{topFunction()}}
              onKeyDown={e=>e.key==='Enter' ? topFunction() : null}
            >
              <CgChevronUpO/>
              <Text as="span" className="visually-hidden">Scroll to top</Text>
            </Button>
            <Box role="tooltip" id="scroll-to-top-desc">Scroll to top</Box>
          </Box>
        </Flex>
        ):(
        <Flex 
          borderLeft="1px"
          borderRight="1px"
          borderBottom="1px"
          borderColor="inherit"
          p="5"
          mb="10"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            as={BigCalendar}
            backgroundColor={primaryColor}
            localizer={localizer}
            events={bigCalendarEvents}
            startAccessor={()=>new Date()}
            endAccessor={()=>new Date()}
            onSelectEvent={(e: any)=>goToBigCalendarEvent(e)}
            sx={{
              height:"80vh",
              width:"95vw",
              '& .rbc-toolbar-label': {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mb: '.75rem'
              },
              '& .rbc-event': {
                border: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                margin: '0',
                padding: '2px 5px',
                backgroundColor: `${primaryColor?.replace(')', ', 0.80)').replace('rgb', 'rgba')}`,
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              },
              '& .rbc-event:hover': {
                backgroundColor: `${primaryColor}`
              }
            }}
            onRangeChange={()=>setBigCalEventBackgrounds()}
          />
        </Flex>
        )}
        {form?.formschema ? (
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
                  '#root__description': {
                    marginBottom: '1.75rem'
                  },
                  'label span': {
                    marginLeft: '1rem'
                  },
                  'input': {
                    marginBottom: '1rem'
                  },
                  'label': {
                    fontWeight: '900'
                  },
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
                <JSONSchemaForm 
                  uiSchema={form?.formuischema ? JSON.parse(form.formuischema) : {"ui:title": " "}}
                  validator={validator}
                  schema={form ? form.formschema : {}} 
                  onSubmit={e=>submitRegForm(e)}
                  autoComplete="on"
                />
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
        ) : ""}
        <Modal 
          size="lg"
          isOpen={openEmailModal} 
          onClose={closeEmailModal}
          aria-label="Email reminder modal"
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
                backgroundColor: 'rgba(0,0,0,.7)',
                color: 'white',
                fontSize: '1rem',
                borderRadius: '10px',
                padding: '.5rem',
                zIndex: "100"
      
              },
              'button:hover + [role="tooltip"], button:focus + [role="tooltip"]' : {
                display: 'block'
              }
            }}
          >
            <ModalHeader me="2rem">
              Email Reminder
              <Box 
                m="2"
                className="element-and-tooltip"

              >
                <ModalCloseButton
                  aria-describedby="email-modal-close-desc"
                  aria-label="close modal"
                  role="close modal"
                />
                <Box role="tooltip" id="email-modal-close-desc">
                  Close
                </Box>
              </Box>
            </ModalHeader>
            <ModalBody>
              <Box w="100%" mb={2}>
                <Text mb={5} color="#727272">
                  You will receive an email the day before the event
                </Text>
                <Input 
                  id="email"
                  type="email" 
                  required
                  aria-required="true"
                  placeholder="Email (required)"
                  _placeholder={{
                    color: "#727272"
                  }}
                  borderColor="black"
                  _hover={{
                    borderColor: "black"
                  }}
                  _dark={{
                    borderColor: "white"
                  }}
                  ref={emailRef as any}
                />
              </Box>
            </ModalBody>
            <ModalFooter>
              <Flex 
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
                flex="0 0 auto"
              >
                <Text 
                  color="#ee0000"
                  role="alert"
                  aria-live="assertive"
                >
                  {emailReminderError}
                </Text>
                <Button 
                  border="1px"
                  borderColor={secondaryColor}
                  backgroundColor={secondaryColor}
                  color={secondaryColor ? "white" : "black"}
                  data-eventid={emailReminderEventId}
                  onClick={e=>setEmailReminder(e)}
                >
                  Submit
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </>
  )
}