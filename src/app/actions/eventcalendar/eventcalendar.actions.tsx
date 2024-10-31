'use server'

import {tokenCookieToLibraryId} from '../../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../../types/types';
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
    let dateStart = new Date(inputDate);
    let dateEnd = new Date(new Date(inputDate).setHours(new Date(inputDate).getHours() + 24));
    if (calRoomId === "All") {
      results = await prisma.event_calendar.findMany({
        where: {
          library: libraryId,
          reservestart: {
            gte: dateStart
          },
          reserveend: {
            lte: dateEnd
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
            gte: dateStart
          },
          reserveend: {
            lte: dateEnd
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
      let roomName = result.room ? await prisma.event_rooms.findFirst({
        where: {
          library: libraryId,
          id: result.room
        }
      }) : null

      let eventType = result.eventtype ? await prisma.event_types.findFirst({
        where: {
          library: libraryId,
          id: result.eventtype
        }
      }) : null

      let formMeta = result.form_id ? await prisma.event_forms.findFirst({
        where: {
          library: libraryId,
          id: result.form_id
        },
        select: {
          id: true,
          title: true,
          form_schema: true,
          date_created: true,
          attendees: true,
          waitinglist: true
        }
      }) : null

      let eventFormData = result.form_id ? await prisma.event_form_data.findMany({
        where: {
          library: libraryId,
          form_id: result.form_id!
        },
        select: {
          id: true,
          form_id: true,
          form_data: true
        }
      }) : null

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
        equipment_ids: result.equipment ? result.equipment : [],
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
    eventTypes = eventTypes.map((et)=>({...et, color: JSON.parse(et.color)}))

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

    await prisma.$disconnect();
    return {success: true, message: "Success", data: returnData}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
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

    // let roomName = room?.name;

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
      room: room,
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
      equipment_ids: eventData.equipment ? JSON.parse(eventData.equipment) : [],
      tags: eventData.tags ? JSON.parse(eventData.tags) : [],
      showroom: eventData.showroom
    }
    await prisma.$disconnect();
    return {success: true, message: "Success", data: returnData}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get calendar data", data: null}
  }
}

export async function postCreateEvent(formData: FormData): Promise<ServerResponseType> {
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
        timezone: true
      }
    })
    let libraryTimezone = library?.timezone ?? "US/Eastern";

    let transId = formData.get("transId")?.valueOf();
    let eventName = formData.get("eventName")?.valueOf();
    let roomId = formData.get("roomId")?.valueOf();
    let reserveDate = formData.get("reserveDate")?.valueOf();
    let reserveStart = formData.get("reserveStart")?.valueOf();
    let reserveEnd = formData.get("reserveEnd")?.valueOf();
    let eventStart = formData.get("eventStart")?.valueOf();
    let eventEnd = formData.get("eventEnd")?.valueOf();
    let typeId = formData.get("typeId")?.valueOf();
    let eventDescription = formData.get("eventDescription")?.valueOf();
    let registrationForm = formData.get("registrationForm")?.valueOf();
    let regFormAttendees = formData.get("regFormAttendees")?.valueOf();
    let regFormWaitingList = formData.get("regFormWaitingList")?.valueOf();
    let showRoom = formData.get("showRoom")?.valueOf();
    let displayStart = formData.get("displayStart")?.valueOf();
    let displayEnd = formData.get("displayEnd")?.valueOf();
    let tags = formData.get("tags")?.valueOf();
    let equipmentIds = formData.get("equipmentIds")?.valueOf();
    let eventHidden = formData.get("eventHidden")?.valueOf();
    let notes = formData.get("notes")?.valueOf();

    if (!eventName) {
      await prisma.$disconnect();
      return {success: false, message: "Please enter a name for your event"}
    }

    if (!roomId) {
      await prisma.$disconnect();
      return {success: false, message: "Please select a room for the event"}
    }

    if (!reserveDate) {
      await prisma.$disconnect();
      return {success: false, message: "Please select a reserve date"}
    }

    if (!reserveStart) {
      await prisma.$disconnect();
      return {success: false, message: "Please select a reserve start time"}
    }

    if (!reserveEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Please select a reserve end time"}
    }

    if (!eventStart) {
      await prisma.$disconnect();
      return {success: false, message: "Please select an event start time"}
    }

    if (!eventEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Please select an event end time"}
    }

    if (reserveStart > reserveEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Reserve start must be before reserve end"}
    }

    if (eventStart < reserveStart) {
      await prisma.$disconnect();
      return {success: false, message: "Event start must be after reserve start"}
    }

    if (eventStart > reserveEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Event start must be before reserve end"}
    }

    if (eventEnd > reserveEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Event end must be before reserve end"}
    }

    if (reserveStart > reserveEnd) {
      await prisma.$disconnect();
      return {success: false, message: "Reserve start but be before reserve end"}
    }

    if (!displayStart && !eventHidden) {
      await prisma.$disconnect();
      return {success: false, message: "Please enter a display start"}
    }

    if (!displayEnd && !eventHidden) {
      await prisma.$disconnect();
      return {success: false, message: "Please enter a display end"}
    }

    if (!eventHidden) {
      displayStart = (displayStart as string).replace("T", " ");
      displayEnd = (displayEnd as string).replace("T", " ");
    }
    else {
      displayStart = undefined;
      displayEnd = undefined;
    }

    if (displayEnd && displayStart && displayEnd < displayStart) {
      await prisma.$disconnect();
      return {success: false, message: "Please start must be before display end"}
    }
    
    if (!typeId) {
      typeId = undefined;
    }

    reserveStart = `${reserveDate} ${reserveStart}`;
    reserveEnd = `${reserveDate} ${reserveEnd}`;
    eventStart = `${reserveDate} ${eventStart}`;
    eventEnd = `${reserveDate} ${eventEnd}`;

    if (registrationForm && (regFormAttendees || regFormWaitingList)) {
      await prisma.event_forms.update({
        where: {
          id: Number(registrationForm),
          library: libraryId
        },
        data: {
          attendees: Number(regFormAttendees),
          waitinglist: Number(regFormWaitingList)
        }
      })
    }

    //for updating existing event
    if (transId) {
      const selectedRoom = await prisma.event_rooms.findUnique({
        where: {
          library: libraryId,
          id: Number(roomId)
        },
        select: {
          name: true
        }
      })
      //If "None" room is selected
      if (selectedRoom && selectedRoom.name != "None") {
        const utcReserveStart = momentTimezone.tz(reserveStart, libraryTimezone).utc().toDate();
        const utcReserveEnd = momentTimezone.tz(reserveEnd, libraryTimezone).utc().toDate();
        const conflictingEvents = await prisma.event_calendar.findMany({
          where: {
            room: Number(roomId),
            library: libraryId,
            transid: { not: Number(transId) },
            OR: [
              {
                reservestart: {
                  lte: utcReserveEnd,
                },
                reserveend: {
                  gte: utcReserveStart,
                }
              },
              {
                reservestart: {
                  gte: utcReserveStart,
                  lte: utcReserveEnd,
                }
              },
              {
                reserveend: {
                  gte: utcReserveStart,
                  lte: utcReserveEnd,
                }
              }
            ]
          }
        });

        if (conflictingEvents.length) {
          let conflictingRooms = conflictingEvents.map(async e => {
              let room = await prisma.event_rooms.findUnique({
                where: {
                  id: Number(e.room),
                  library: libraryId
                },
                select: {
                  name: true
                }
              })
              return room?.name
            });
          await prisma.$disconnect();
          return {success: false, message: `Overlapping reserves: ${conflictingRooms.join(", ")}`}
        }
      }
      await prisma.event_calendar.update({
        where: {
          library: libraryId,
          transid: Number(transId)
        },
        data: {
          room: Number(roomId),
          eventname: eventName,
          reservestart: momentTimezone.tz(reserveStart, libraryTimezone).utc().toDate(),
          reserveend: momentTimezone.tz(reserveEnd, libraryTimezone).utc().toDate(),
          eventstart: momentTimezone.tz(eventStart, libraryTimezone).utc().toDate(),
          eventend: momentTimezone.tz(eventEnd, libraryTimezone).utc().toDate(),
          notes: notes,
          eventtype: Number(typeId),
          eventhidden: eventHidden ? true : false,
          description: eventDescription,
          form_id: registrationForm ? Number(registrationForm) : null,
          displaystart: momentTimezone.tz(displayStart, libraryTimezone).utc().toDate(),
          displayend: momentTimezone.tz(displayEnd, libraryTimezone).utc().toDate(),
          equipment: equipmentIds ? JSON.stringify((equipmentIds as string).split(",")) : null,
          tags: tags ? JSON.stringify((tags as string).split(",")) : null,
          showroom: showRoom ? true : false
        }
      })
      await prisma.$disconnect();
      return {success: true, message: "Success"}
    }
    else {
      let events = await prisma.event_calendar.findMany({
        where: {
          library: libraryId
        },
        select: {transid: true}
      })

      let eventCount = events.length;

      if (eventCount <= 1000) {
        const selectedRoom = await prisma.event_rooms.findUnique({
          where: {
            library: libraryId,
            id: Number(roomId)
          },
          select: {
            name: true
          }
        })
        //this is if a library creates a room named "None" - allows override of check double booking
        if (selectedRoom && selectedRoom.name != "None") {
          const utcReserveStart = momentTimezone.tz(reserveStart, libraryTimezone).utc().toDate();
          const utcReserveEnd = momentTimezone.tz(reserveEnd, libraryTimezone).utc().toDate();
          const conflictingEvents = await prisma.event_calendar.findMany({
            where: {
              room: Number(roomId),
              library: libraryId,
              transid: { not: Number(transId) },
              OR: [
                {
                  reservestart: {
                    lte: utcReserveEnd,
                  },
                  reserveend: {
                    gte: utcReserveStart,
                  }
                },
                {
                  reservestart: {
                    gte: utcReserveStart,
                    lte: utcReserveEnd,
                  }
                },
                {
                  reserveend: {
                    gte: utcReserveStart,
                    lte: utcReserveEnd,
                  }
                }
              ]
            }
          });
  
          if (conflictingEvents.length) {
            let conflictingRooms = conflictingEvents.map(async e => {
                let room = await prisma.event_rooms.findUnique({
                  where: {
                    id: Number(e.room),
                    library: libraryId
                  },
                  select: {
                    name: true
                  }
                })
                return room?.name
              });
            await prisma.$disconnect();
            return {success: false, message: `Overlapping reserves: ${conflictingRooms.join(", ")}`}
          }
        }
        await prisma.event_calendar.create({
          data: {
            library: libraryId,
            room: Number(roomId),
            eventname: eventName as string,
            reservestart: momentTimezone.tz(reserveStart, libraryTimezone).utc().toDate(),
            reserveend: momentTimezone.tz(reserveEnd, libraryTimezone).utc().toDate(),
            eventstart: momentTimezone.tz(eventStart, libraryTimezone).utc().toDate(),
            eventend: momentTimezone.tz(eventEnd, libraryTimezone).utc().toDate(),
            notes: notes as string,
            eventtype: Number(typeId),
            eventhidden: eventHidden ? true : false,
            description: eventDescription as string,
            form_id: registrationForm ? Number(registrationForm) : null,
            displaystart: momentTimezone.tz(displayStart, libraryTimezone).utc().toDate(),
            displayend: momentTimezone.tz(displayEnd, libraryTimezone).utc().toDate(),
            equipment: equipmentIds ? JSON.stringify((equipmentIds as string).split(",")) : null,
            tags: tags ? JSON.stringify(tags) : null,
            showroom: showRoom ? true : false
          }
        })
        await prisma.$disconnect();
        return {success: true, message: "Success"}
      }
      else {
        await prisma.$disconnect();
        return {success: false, message: "Number of event limit exceeded"}
      }
    }
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to create event"}
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
    await prisma.$disconnect();
    return {success: false, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete event"}
  }
}