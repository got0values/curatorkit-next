'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getEvents(inputDate: string, calRoomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      },
      select: {
        timezone: true,
        subdomain: true
      }
    })

    let libraryTimezone = library?.timezone ?? "US/Eastern";

    var results = null;
    if (calRoomId === "All") {
      results = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          reservestart: {
            gte: new Date(inputDate)
          },
          reserveend: {
            lte: new Date(inputDate)
          }
        },
        select: {
          transid: true,
          room: true,
          eventname: true,
          reservestart: true,
          eventstart: true,
          eventend: true,
          reserveend: true,
          notes: true,
          eventhidden: true,
          eventtype: true,
          description: true,
          form_id: true,
          displaystart: true,
          displayend: true,
          equipment: true,
          tags: true,
          showroom: true,
        },
      });
    }
    else {
      results = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          room: Number(calRoomId),
          reservestart: {
            gte: new Date(inputDate)
          },
          reserveend: {
            lte: new Date(inputDate)
          }
        },
        select: {
          transid: true,
          room: true,
          eventname: true,
          reservestart: true,
          eventstart: true,
          eventend: true,
          reserveend: true,
          notes: true,
          eventhidden: true,
          eventtype: true,
          description: true,
          form_id: true,
          displaystart: true,
          displayend: true,
          equipment: true,
          tags: true,
          showroom: true,
        },
      });
    }

    const formattedResults = results?.map(result => ({
      ...result,
      reservestart: momentTimezone.tz(result.reservestart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      eventstart: momentTimezone.tz(result.eventstart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      eventend: momentTimezone.tz(result.eventend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      reserveend: momentTimezone.tz(result.reserveend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      displaystart: result.displaystart ? momentTimezone.tz(result.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
      displayend: result.displayend ? momentTimezone.tz(result.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A') : null,
    }));

    let events = [];

    for (var result of formattedResults) {
      let roomName = await prisma.event_rooms.findFirst({
        where: {
          library: libraryId,
          id: result.room!
        }
      })

      let eventType = await prisma.event_types.findFirst({
        where: {
          library: libraryId,
          id: result.eventtype!
        }
      })

      let formMeta = await prisma.event_forms.findFirst({
        where: {
          library: libraryId,
          id: result.form_id!
        },
        select: {
          id: true,
          title: true,
          form_schema: true,
          date_created: true,
          attendees: true,
          waitinglist: true
        }
      })

      let eventFormData = await prisma.event_form_data.findMany({
        where: {
          library: libraryId,
          form_id: result.form_id!
        },
        select: {
          id: true,
          form_id: true,
          form_data: true
        }
      })

      let eventData = {
        transid: result.transid,
        roomid: result.room,
        room: roomName,
        event: result.eventname,
        reservedate: result.reservestart,
        reservestart: result.reservestart,
        eventstart: result.eventstart,
        eventend: result.eventend,
        reserveend: result.reserveend,
        notes: result.notes,
        eventhidden: result.eventhidden,
        typeid: result.eventtype,
        type: eventType,
        description: result.description,
        formid: result.form_id,
        displaystart: result.displaystart,
        displayend: result.displayend,
        formmeta: formMeta,
        formdata: eventFormData,
        equipment_ids: result.equipment !== "" ? JSON.stringify(result.equipment) : [],
        tags: result.tags ? result.tags : [],
        showroom: result.showroom
      }

      events.push(eventData);
    }

    let eventTypes = await prisma.event_types.findMany({
      where: {
        library: libraryId
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    let eventRooms = await prisma.event_rooms.findMany({
      where: {
        library: libraryId
      },
      select: {
        id: true,
        name: true
      }
    })

    let eventEquipment = await prisma.event_equipment.findMany({
      where: {
        library: libraryId
      },
      select: {
        id: true,
        name: true
      }
    })

    let eventForms = await prisma.event_forms.findMany({
      where: {
        library: libraryId
      },
      select: {
        id: true,
        title: true,
        form_schema: true,
        date_created: true,
        attendees: true,
        waitinglist: true
      }
    })

    let formIds = eventForms?.map(f => f.id);

    let eventFormData = await prisma.event_form_data.findMany({
      where: {
        library: libraryId,
        form_id: {
          in: formIds
        },
      },
      select: {
        id: true,
        form_id: true,
        form_data: true,
      },
    });

    var subdomain = library?.subdomain;

    var resultsTwo = await prisma.event_calendar.findMany({
      where: {
        library: libraryId
      },
      select: {
        transid: true,
        eventname: true,
        reservestart: true,
        reserveend: true
      }
    })

    var eventsTwo = resultsTwo.map(event => ({
      id: event.transid,
      title: event.eventname,
      allDay: false,
      start: momentTimezone.tz(event.reservestart, 'UTC').tz(libraryTimezone).format(),
      end: momentTimezone.tz(event.reserveend, 'UTC').tz(libraryTimezone).format()
    }));

    let returnData = {
      events: events,
      eventtypes: eventTypes,
      eventrooms: eventRooms,
      equipment: eventEquipment,
      eventforms: eventForms,
      eventformdata: eventFormData,
      subdomain: subdomain,
      eventsTwo: eventsTwo,
      eventscount: eventsTwo.length,
    }

    return {success: true, message: "Success", data: returnData}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get events", data: null}
  }
}

export async function getBigCalData(eventId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      },
      select: {
        timezone: true,
        subdomain: true
      }
    })

    let libraryTimezone = library?.timezone ?? "US/Eastern";

    let event = await prisma.event_calendar.findUnique({
      where: {
        library: libraryId,
        transid: Number(eventId)
      }
    })

    let eventData = {
      id: event?.transid,
      room: event?.room,
      eventName: event?.eventname,
      reserveStart: momentTimezone.tz(event?.reservestart, 'UTC').tz(libraryTimezone).format('YYYY-MM-DD HH:mm:ss'),
      eventStart: momentTimezone.tz(event?.eventstart, 'UTC').tz(libraryTimezone).format('YYYY-MM-DD HH:mm:ss'),
      eventEnd: momentTimezone.tz(event?.eventend, 'UTC').tz(libraryTimezone).format('YYYY-MM-DD HH:mm:ss'),
      reserveEnd: momentTimezone.tz(event?.reserveend, 'UTC').tz(libraryTimezone).format('YYYY-MM-DD HH:mm:ss'),
      notes: event?.notes,
      eventHidden: event?.eventhidden,
      eventType: event?.eventtype,
      description: event?.description,
      formId: event?.form_id,
      displayStart: momentTimezone.tz(event?.displaystart, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      displayEnd: momentTimezone.tz(event?.displayend, 'UTC').tz(libraryTimezone).format('MM/DD/YYYY hh:mm A'),
      equipment: event?.equipment,
      tags: event?.tags,
      showroom: event?.showroom,
    };

    const room = await prisma.event_rooms.findUnique({
      where: {
        id: Number(eventData.room),
        library: libraryId,
      },
      select: {
        name: true,
      },
    });

    let roomName = room?.name;

    let eventType = await prisma.event_types.findUnique({
      where: {
        library: libraryId,
        id: Number(eventData.eventType)
      },
      select: {
        name: true
      }
    })

    let formMetaSchema = await prisma.event_forms.findUnique({
      where: {
        library: libraryId,
        id: Number(eventData.formId)
      },
      select: {
        id: true,
        title: true,
        form_schema: true,
        date_created: true,
        attendees: true,
        waitinglist: true
      }
    })

    let formData = await prisma.event_form_data.findFirst({
      where: {
        library: libraryId,
        form_id: Number(eventData.formId)
      },
      select: {
        id: true,
        form_id: true,
        form_data: true
      }
    })

    let returnData = {
      transid: eventData.id,
      roomid: eventData.room,
      room: roomName,
      event: eventData.eventName,
      reservedate: eventData.reserveStart,
      reservestart: eventData.reserveStart,
      eventstart: eventData.eventStart,
      eventend: eventData.eventEnd,
      reserveend: eventData.reserveEnd,
      notes: eventData.notes,
      eventhidden: eventData.eventHidden,
      typeid: eventData.eventType,
      type: eventType,
      description: eventData.description,
      formid: eventData.formId,
      displaystart: eventData.displayStart,
      displayend: eventData.displayEnd,
      formmeta: formMetaSchema,
      formdata: formData,
      equipment_ids: eventData.equipment !== "" ? JSON.stringify(eventData.equipment) : [],
      tags: eventData.tags ? eventData.tags : [],
      showroom: eventData.showroom
    }

    return {success: true, message: "Success", data: returnData}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get calendar data", data: null}
  }
}

export async function deleteEvent(eventId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.event_calendar.delete({
      where: {
        library: libraryId,
        transid: Number(eventId)
      }
    })

    return {success: false, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to delete event"}
  }
}