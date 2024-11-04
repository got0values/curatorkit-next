'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getFeEvents(subdomain: string, inputDate: string, calTypesId: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }

    const libraryTimezone = library?.timezone;
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');
    let events = [];
    if (calTypesId == "All") {
      events = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventstart: {
            gte: new Date(inputDate),
          },
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
          eventhidden: false,
        }
      })
      events = events?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }
    else {
      events = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventstart: {
            gte: new Date(inputDate.replace(/"/g, '')),
          },
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
          eventhidden: false,
          eventtype: Number(calTypesId)
        }
      })
      events = events?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }
    let eventData = [];
    for (var event of events) {
      let room = await prisma.event_rooms.findUnique({
        where: {
          id: Number(event.room)
        },
        select: {
          name: true
        }
      });
      let roomName = room?.name;
      
      let eventType = await prisma.event_types.findUnique({
        where: {
          library: libraryId,
          id: Number(event.eventtype)
        },
        select: {
          name: true,
          color: true
        }
      })
      let eventTypeName = eventType ? eventType.name : "";
      var eventTypeColor = eventType ? eventType.color : "";

      let formId = event.form_id;
      let regInfo = await prisma.event_forms.findUnique({
        where: {
          id: Number(formId)
        }
      })

      let eventFormData = await prisma.event_form_data.findMany({
        where: {
          form_id: Number(formId)
        }
      })
      let numberRegistered = eventFormData.length;
      let registrationType = "Register";
      let attendees = regInfo ? regInfo.attendees! : 0;
      let waitingList = regInfo ?regInfo?.waitinglist! : 0;
      if (attendees - numberRegistered <= 0) {
        registrationType = "Waiting List";
      }
      if (numberRegistered >= attendees + waitingList) {
        registrationType = "Registration Closed";
        formId = null;
      }

      eventData.push({
        ...event,
        roomName,
        eventTypeName,
        eventTypeColor,
        numberRegistered,
        attendees,
        waitingList,
        registrationType
      })
    }

    let eventTypes = await prisma.event_types.findMany({
      where: {
        library: libraryId
      }
    })

    let bigCalendarResults = [];
    bigCalendarResults = await prisma.event_calendar.findMany({
      where: {
        library: libraryId,
        displaystart: {
          lt: new Date(currentDate),
        },
        displayend: {
          gt: new Date(currentDate),
        },
        eventhidden: false
      }
    })
    bigCalendarResults = bigCalendarResults?.map(result => ({
      ...result,
      reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
      displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
      tags: result.tags ? JSON.parse(result.tags) : [],
      equipment: result.equipment ? JSON.parse(result.equipment) : []
    }));

    let bigCalendarEvents = [];
    for (let result of bigCalendarResults) {
      let type = await prisma.event_types.findUnique({
        where: {
          id: Number(result.eventtype)
        }
      })
      let typeColor = type?.color;
      bigCalendarEvents.push({
        ...result,
        typeColor
      })
    }
  
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        events: eventData,
        eventTypes: eventTypes,
        bigCalendarEvents,
        timezone: libraryTimezone
      }
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get events", data: null}
  }
}

export async function getFeCalendarMonths(subdomain: string, inputMonth: string, calTypesId: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }
    
    const libraryTimezone = library?.timezone;
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    let monthEvents = [];
    if (calTypesId === "All") {
      monthEvents = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventhidden: false,
          eventstart: {
            gte: new Date(`${inputMonth}-01T00:00:00Z`),
            lt: new Date(`${inputMonth}-31T23:59:59Z`),
          },
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
        }
      })
      monthEvents = monthEvents?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }
    else {
      monthEvents = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventhidden: false,
          eventtype: Number(calTypesId),
          eventstart: {
            gte: new Date(`${inputMonth}-01T00:00:00Z`),
            lt: new Date(`${inputMonth}-31T23:59:59Z`),
          },
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
        }
      })
      monthEvents = monthEvents?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }

    let monthEventData = [];
    for (let monthEvent of monthEvents) {
      let roomName = await prisma.event_rooms.findUnique({
        where: {
          library: libraryId,
          id: Number(monthEvent.room)
        }
      })

      let monthEventType = await prisma.event_types.findUnique({
        where: {
          library: libraryId,
          id: Number(monthEvent.eventtype)
        },
        select: {
          name: true,
          color: true
        }
      })
      let monthEventTypeName = monthEventType ? monthEventType.name : "";
      var monthEventTypeColor = monthEventType ? monthEventType.color : "";

      let formId = monthEvent.form_id;
      let regInfo = await prisma.event_forms.findUnique({
        where: {
          library: libraryId,
          id: Number(formId)
        }
      })

      let eventFormData = await prisma.event_form_data.findMany({
        where: {
          library: libraryId,
          id: Number(formId)
        }
      })
      let numberRegistered = eventFormData.length;

      let registrationType = "Register";
      let attendees = regInfo ? regInfo.attendees! : 0;
      let waitingList = regInfo ?regInfo?.waitinglist! : 0;
      if (attendees - numberRegistered <= 0) {
        registrationType = "Waiting List";
      }
      if (numberRegistered >= attendees + waitingList) {
        registrationType = "Registration Closed";
        formId = null;
      }

      monthEventData.push({
        ...monthEvent,
        roomName,
        monthEventTypeName,
        monthEventTypeColor,
        formId,
        numberRegistered,
        attendees,
        waitingList,
        registrationType
      })
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: monthEventData}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get calendar months", data: null}
  }
}

export async function getFeCalendarSearch(subdomain: string, searchTerm: string, calTypesId: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }
    
    const libraryTimezone = library?.timezone;
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    let searchEvents = [];
    if (calTypesId === "All") {
      searchEvents = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventhidden: false,
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
        }
      })
      searchEvents = searchEvents?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }
    else {
      searchEvents = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          eventhidden: false,
          eventtype: Number(calTypesId),
          displaystart: {
            lt: new Date(currentDate),
          },
          displayend: {
            gt: new Date(currentDate),
          },
        }
      })
      searchEvents = searchEvents?.map(result => ({
        ...result,
        reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
        displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
        tags: result.tags ? JSON.parse(result.tags) : [],
        equipment: result.equipment ? JSON.parse(result.equipment) : []
      }));
    }

    let searchEventData = [];
    for (let searchEvent of searchEvents) {
      let roomName = await prisma.event_rooms.findUnique({
        where: {
          library: libraryId,
          id: Number(searchEvent.room)
        }
      })

      let searchEventType = await prisma.event_types.findUnique({
        where: {
          library: libraryId,
          id: Number(searchEvent.eventtype)
        },
        select: {
          name: true,
          color: true
        }
      })
      let searchEventTypeName = searchEventType ? searchEventType.name : "";
      var searchEventTypeColor = searchEventType ? searchEventType.color : "";

      let formId = searchEvent.form_id;
      let regInfo = await prisma.event_forms.findUnique({
        where: {
          library: libraryId,
          id: Number(formId)
        }
      })

      let eventFormData = await prisma.event_form_data.findMany({
        where: {
          library: libraryId,
          id: Number(formId)
        }
      })
      let numberRegistered = eventFormData.length;

      let registrationType = "Register";
      let attendees = regInfo ? regInfo.attendees! : 0;
      let waitingList = regInfo ?regInfo?.waitinglist! : 0;
      if (attendees - numberRegistered <= 0) {
        registrationType = "Waiting List";
      }
      if (numberRegistered >= attendees + waitingList) {
        registrationType = "Registration Closed";
        formId = null;
      }

      searchEventData.push({
        ...searchEvent,
        roomName,
        searchEventTypeName,
        searchEventTypeColor,
        formId,
        numberRegistered,
        attendees,
        waitingList,
        registrationType
      })
    }

    let searchResults = [];
    for (let event of searchEventData) {
      if ((event.tags && (
          event.tags.map((tag: string)=>tag.toLowerCase()).includes(searchTerm.toLowerCase())) || 
          event.eventname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )) {
        searchResults.push(event)
      }
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: searchResults}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get calendar search results", data: null}
  }
}

export async function getFeForm(subdomain: string, formId: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }
    
    let formSchema = await prisma.event_forms.findUnique({
      where: {
        library: libraryId,
        id: Number(formId)
      },
      select: {
        form_schema: true,
        form_ui_schema: true
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {...formSchema}
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get form.", data: null}
  }
}

export async function postRegForm(subdomain: string, regFormData: any, regFormId: string, regFormTypeName: string, regFormTypeId: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }

    let regInfo = await prisma.event_forms.findUnique({
      where: {
        id: Number(regFormId)
      },
      select: {
        attendees: true,
        waitinglist: true
      }
    })

    let eventFormData = await prisma.event_form_data.findMany({
      where: {
        form_id: Number(regFormId)
      }
    })
    let numberRegistered = eventFormData.length;

    let registrationType = "Register";
    let attendees = regInfo?.attendees ? regInfo.attendees : 0;
    let waitingList = regInfo?.waitinglist ? regInfo.waitinglist : 0;

    if (attendees - numberRegistered <= 0) {
      registrationType = "Waiting List"
    }
    if (numberRegistered >= (attendees + waitingList)) {
      registrationType = "Registration closed"
    }

    await prisma.event_form_data.create({
      data: {
        form_id: Number(regFormId),
        form_data: regFormData,
        datetime: new Date().toUTCString(),
        eventtypename: regFormTypeName,
        eventtypeid: Number(regFormTypeId),
        library: libraryId
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success",
      data: registrationType
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to post registration form.", data: null}
  }
}