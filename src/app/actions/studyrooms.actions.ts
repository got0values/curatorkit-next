'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getStudyRooms(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      }
    })

    let subdomain = library?.subdomain;

    let rooms = await prisma.study_rooms.findMany({
      where: {
        library: libraryId
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: {subdomain: subdomain, studyRooms: rooms}}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get study rooms"}
  }
}

export async function getStudyRoomData(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      }
    })

    const libraryTimezone = library?.timezone;

    let studyRoomData = [];
    studyRoomData = await prisma.study_room_form_data.findMany({
      where: {
        library: libraryId
      }
    })
    studyRoomData = studyRoomData.map((r)=>({
      ...r,
      request_datetime_from: momentTimezone.tz(r.request_datetime_from, 'UTC').tz(libraryTimezone!).format('YYYY-MM-DD HH:mm'),
      request_datetime_to: momentTimezone.tz(r.request_datetime_to, 'UTC').tz(libraryTimezone!).format('YYYY-MM-DD HH:mm'),
      title: r.study_room_name,
      start: momentTimezone.tz(r.request_datetime_from, 'UTC').tz(libraryTimezone!).format(),
      end: momentTimezone.tz(r.request_datetime_to, 'UTC').tz(libraryTimezone!).format()
    }))
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: studyRoomData}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get study rooms"}
  }
}

export async function postSaveStudyRoom(roomName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!roomName) {
      return {success: false, message: "Please enter a room name"}
    }
    
    await prisma.study_rooms.create({
      data: {
        library: libraryId,
        name: roomName
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: null}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save study room"}
  }
}

export async function deleteStudyRoom(roomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!roomId) {
      return {success: false, message: "Failed to delete study room"}
    }
    
    await prisma.study_rooms.delete({
      where: {
        library: libraryId,
        id: Number(roomId)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: null}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete study room"}
  }
}

export async function getEditStudyRoom(roomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!roomId) {
      return {success: false, message: "Failed to get study room"}
    }

    let studyRoom = await prisma.study_rooms.findUnique({
      where: {
        library: libraryId,
        id: Number(roomId)
      }
    })

    let forms = await prisma.reserve_forms.findMany({
      where: {
        library: libraryId
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: {studyRoom, forms}}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get study room"}
  }
}

export async function putEditStudyRoomFormData(formFrom: string, formTo: string, confirmed: boolean, formDataId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      }
    })

    const libraryTimezone = library?.timezone ?? "US/Eastern";

    await prisma.study_room_form_data.update({
      where: {
        library: libraryId,
        id: Number(formDataId)
      },
      data: {
        request_datetime_from: formFrom ? momentTimezone.tz(formFrom, 'UTC').tz(libraryTimezone).toDate() : undefined,
        request_datetime_to: formTo ? momentTimezone.tz(formTo, 'UTC').tz(libraryTimezone).toDate() : undefined,
        confirmed: confirmed
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: null}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to update reserve"}
  }
}

export async function deleteStudyRoomReserve(formDataId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!formDataId) {
      return {success: false, message: "Failed to delete reserve"}
    }
    
    await prisma.study_room_form_data.delete({
      where: {
        library: libraryId,
        id: Number(formDataId)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: null}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete reserve"}
  }
}

export async function putEditStudyRoom(studyRoomName: string, studyRoomFormId: string, studyRoomId: string, studyRoomDesc: string, studyRoomMin: string, studyRoomMax: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.study_rooms.update({
      where: {
        library: libraryId,
        id: Number(studyRoomId)
      },
      data: {
        name: studyRoomName,
        form: Number(studyRoomFormId),
        description: studyRoomDesc,
        minimum_capacity: Number(studyRoomMin),
        maximum_capacity: Number(studyRoomMax)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: null}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to update study room"}
  }
}