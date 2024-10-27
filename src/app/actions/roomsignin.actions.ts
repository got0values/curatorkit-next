'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getRoomSignIns(roomId: string): Promise<ServerResponseType> {
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
    const localTimezone = library?.timezone;

    const now = momentTimezone().tz(localTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    const list = await prisma.signInLists.findUnique({
      where: {
        id: Number(roomId)
      },
      select: {
        name: true,
        library: true
      }
    })

    if (!list || list?.library !== Number(libraryId)) {
      await prisma.$disconnect();
      return {success: false, message: "Error", data: null}
    }

    const signIns: SignInType[] = await prisma.signIns.findMany({
      where: {
        library: libraryId,
        listId: Number(roomId),
        datetime: {
          gte: momentTimezone.tz(currentDate + ' 00:00:00', localTimezone!).toDate(),
          lt: momentTimezone.tz(currentDate + ' 23:59:59', localTimezone!).toDate(),
        },
      },
      orderBy: {
        datetime: 'desc',
      },
      select: {
        transId: true,
        listId: true,
        library: true,
        card: true,
        name: true,
        datetime: true,
        notes: true,
      },
    });
    const roomName = list.name;
    await prisma.$disconnect();
    return {success: true, message: "Success", data: {signIns,roomName}}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get room sign-in", data: null}
  }
}

export async function postSignIn(roomId: string, cardNum: string): Promise<ServerResponseType> {
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
    const localTimezone = library?.timezone;
    const now = momentTimezone().tz(localTimezone!);
    const libraryDateTime = now.format('YYYY-MM-DDTHH:mm:ssZ');

    if (cardNum === "") {
      await prisma.$disconnect();
      return {success: false, message: "No barcode"}
    }

    const nameList = await prisma.namelist.findFirst({
      where: {
        card: cardNum,
        library: libraryId
      },
      select: {
        name: true
      }
    })

    let name = ""
    if (nameList && nameList.name) {
      name = nameList.name;
    }

    await prisma.signIns.create({
      data: {
        listId: Number(roomId),
        library: libraryId,
        card: cardNum,
        name: name,
        datetime: libraryDateTime,
        notes: ""
      }
    })

    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to post room sign-in"}
  }
}

export async function deleteSignIn(transId: string, listId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    await prisma.signIns.delete({
      where: {
        library: libraryId,
        transId: Number(transId),
        listId: Number(listId)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete sign-in"}
  }
}

export async function postNotes(notesInput: string, transId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    await prisma.signIns.update({
      where: {
        library: libraryId,
        transId: Number(transId)
      },
      data: {
        notes: notesInput
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to add notes"}
  }
}

export async function deleteNote(transId: string, roomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    await prisma.signIns.update({
      where: {
        listId: Number(roomId),
        library: libraryId,
        transId: Number(transId)
      },
      data: {
        notes: ""
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to add notes"}
  }
}