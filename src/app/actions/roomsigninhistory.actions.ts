'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import { getInputLibraryTimezoneDateStart, getInputLibraryTimezoneDateEnd } from '../helpers/dateHelper';

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
    const libraryTimezone = library?.timezone ?? "US/Eastern";

    const inputDate1UTC = getInputLibraryTimezoneDateStart(inputDate1, libraryTimezone);
    const inputDate2UTC = getInputLibraryTimezoneDateEnd(inputDate2, libraryTimezone);

    let results: SignInType[] | [] = []
    if (listId === "All") {
      results = await prisma.signIns.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
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
            gte: inputDate1UTC,
            lte: inputDate2UTC
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