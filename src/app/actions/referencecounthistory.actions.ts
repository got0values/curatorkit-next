'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getReferenceCountHistory(inputDate1: string, inputDate2: string): Promise<ServerResponseType> {
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

    let results = [];
    results = await prisma.compSignIns.findMany({
      where: {
        library: libraryId,
        datetimein: {
          gte: new Date(inputDate1),
          lte: new Date(inputDate2)
        },
      }
    })

    let signIns = [];
    for (var result of results) {
      let comp = await prisma.computers.findUnique({
        where: {
          library: libraryId,
          id: result.computer
        }
      })
      signIns.push({
        ...result,
        computerName: comp?.name,
        datetimein: momentTimezone(result.datetimein).tz(libraryTimezone).toDate(),
        datetimeout: momentTimezone(result.datetimeout).tz(libraryTimezone).toDate()
      })
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: signIns}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get computer sign-ins", data: null}
  }
}