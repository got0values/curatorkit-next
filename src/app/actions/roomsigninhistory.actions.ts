'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getRoomSignInHistory(listId: string, inputDate1: string, inputDate2: string): Promise<ServerResponseType> {
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

    let results: SignInType[] | [] = []
    if (listId === "All") {
      results = await prisma.signIns.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: new Date(inputDate1),
            lte: new Date(inputDate2)
          },
        }
      })
    }
    else {
      results = await prisma.signIns.findMany({
        where: {
          library: libraryId,
          listId: Number(listId),
          datetime: {
            gte: new Date(inputDate1),
            lte: new Date(inputDate2)
          },
        }
      })
    }

    for (var result of results) {
      let list = await prisma.signInLists.findUnique({
        where: {
          library: libraryId,
          id: result.listId
        }
      })
      let listIdName = list?.name;
      result.listIdName = listIdName;
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: results}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get room sign-ins", data: null}
  }
}