'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getStudyRoomsFe(subdomain: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    if (!library) {
      return {success: false, message: "Library not found"}
    }
    const libraryId = library.id;

    let rooms = await prisma.study_rooms.findMany({
      where: {
        library: libraryId
      }
    })
    let roomsDTO = [];
    for (var room of rooms) {
      let form = await prisma.reserve_forms.findUnique({
        where: {
          library: libraryId,
          id: Number(room.form)
        }
      })
      roomsDTO.push({
        ...room,
        formId: room.form,
        form: form
      })
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: roomsDTO}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get study rooms"}
  }
}

export async function postStudyRoomFeRegData(regFormData: string, regFormId: string, regFormRoomName: string, regFormRoomId: string, regFormDate: string, regFormTimeFrom: string, regFormTimeTo: string, subdomain: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    if (!library) {
      return {success: false, message: "Library not found"}
    }
    const libraryId = library.id;
    const libraryTimezone = library?.timezone ?? "US/Eastern";
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    if (!regFormDate) {
      return {success: false, message: "Please select a date"}
    }
    if (!regFormTimeFrom) {
      return {success: false, message: "Please select a start time"}
    }
    if (!regFormTimeTo) {
      return {success: false, message: "Please select an end time"}
    }

    if (new Date(regFormTimeTo) < new Date(regFormTimeFrom)) {
      return {success: false, message: "Reserve time end must be after reserve time start"}
    }

    const dateTimeFrom = regFormDate + " " + regFormTimeFrom;
    const dateTimeTo = regFormDate + " " + regFormTimeTo;

    let timeTaken = await prisma.study_room_form_data.findMany({
      where: {
        library: libraryId,
        confirmed: true,
        study_room_id: Number(regFormRoomId),
        OR: [
          {
            request_datetime_from: {
              gte: momentTimezone.tz(dateTimeFrom, libraryTimezone!).utc().toDate(),
              lte: momentTimezone.tz(dateTimeTo, libraryTimezone!).utc().toDate()
            },
          },
          {
            request_datetime_to: {
              gte: momentTimezone.tz(dateTimeFrom, libraryTimezone!).utc().toDate(),
              lte: momentTimezone.tz(dateTimeTo, libraryTimezone!).utc().toDate()
            },
          },
          {
            AND: [
              { 
                request_datetime_from: 
                { 
                  lte: momentTimezone.tz(dateTimeFrom, libraryTimezone!).utc().toDate()
                } 
              },
              { 
                request_datetime_to: 
                { 
                  gte: momentTimezone.tz(dateTimeTo, libraryTimezone!).utc().toDate() 
                } 
              }
            ],
          },
        ],
      }
    })

    if (timeTaken.length) {
      return {success: false, message: "Reserve time not available"}
    }

    await prisma.study_room_form_data.create({
      data: {
        library: libraryId,
        form_data: regFormData,
        form_id: Number(regFormId),
        study_room_name: regFormRoomName,
        study_room_id: Number(regFormRoomId),
        request_datetime_from: momentTimezone.tz(dateTimeFrom, libraryTimezone!).utc().toDate(),
        request_datetime_to: momentTimezone.tz(dateTimeTo, libraryTimezone!).utc().toDate(),
        datetime_submitted: new Date()
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save study room form"}
  }
}