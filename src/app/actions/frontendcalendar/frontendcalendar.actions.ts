'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getFeEvents(subdomain: string, inputDate: string, calTypesId: string, formId: string = ""): Promise<ServerResponseType> {
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

    if (!formId) {
      let events = [];
      if (calTypesId == "All") {
        events = await prisma.event_calendar.findMany({
          where: {
            library: libraryId,
            eventstart: {
              gte: new Date(inputDate.replace(/"/g, '')), // Assumes `inputDate` is in ISO format for conversion
            },
            displaystart: {
              lt: currentDate,
            },
            displayend: {
              gt: currentDate,
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
              lt: currentDate,
            },
            displayend: {
              gt: currentDate,
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
            lt: currentDate,
          },
          displayend: {
            gt: currentDate,
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
    else if (!inputDate && !calTypesId ) {
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
    return {
      success: false, 
      message: "Success", 
      data: null
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get events", data: null}
  }
}