'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getCompSignIns(): Promise<ServerResponseType> {
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
    if (!library) {
      return {success: false, message: "Unauthorized"}
    }

    const libraryTimezone = library?.timezone;
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    let computers = await prisma.computers.findMany({
      where: {
        library: libraryId
      }
    })

    let compCard = [];
    for (var computer of computers) {
      let compSignIn = await prisma.compSignIns.findFirst({
        where: {
          library: libraryId,
          computer: computer.id,
          name: {
            not: ""
          },
          datetimeout: null
        },
        orderBy: {
          datetimein: "desc"
        }
      })
      if (compSignIn) {
        compCard.push({
          id: computer.id,
          name: computer.name,
          signindata: {
            transid: compSignIn.transid,
            name: compSignIn.name,
            length: compSignIn.length,
            timein: momentTimezone(compSignIn.datetimein).tz(libraryTimezone).format('HH:mm'),
            timeout: momentTimezone(compSignIn.datetimeout).tz(libraryTimezone).format('HH:mm'),
            datetimein: momentTimezone(compSignIn.datetimein).tz(libraryTimezone).format('YYYY-MM-DD HH:mm')
            }
        })
      }
      else {
        compCard.push({
          id: computer.id,
          name: computer.name
        })
      }
    }

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: compCard
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get computer sign-ins.", data: null}
  }
}