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

export async function postAddComputer(compName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!compName) {
      return {success: false, message: "Please add a computer name"}
    }

    await prisma.computers.create({
      data: {
        library: libraryId,
        name: compName
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to add computer.", data: null}
  }
}

export async function deleteComputer(compId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!compId) {
      return {success: false, message: "Failed to delete computer"}
    }

    await prisma.computers.delete({
      where: {
        library: libraryId,
        id: Number(compId)
      }
    })    

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete computer.", data: null}
  }
}

export async function postAddTimeIn(nameInput: string, timeInput: string, compId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!nameInput || !timeInput || !compId) {
      return {success: false, message: "Failed to add time-in"}
    }

    if (Number(timeInput) <= 0) {
      return {success: false, message: "Time must be greater than 0"}
    }

    await prisma.compSignIns.create({
      data: {
        library: libraryId,
        name: nameInput,
        datetimein: new Date(),
        length: Number(timeInput),
        computer: Number(compId)
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to add time-in.", data: null}
  }
}

export async function postAddTimeOut(timeOutTransId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!timeOutTransId) {
      return {success: false, message: "Failed to time-out"}
    }

    await prisma.compSignIns.update({
      where: {
        library: libraryId,
        transid: Number(timeOutTransId)
      },
      data: {
        datetimeout: new Date()
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to time-out.", data: null}
  }
}