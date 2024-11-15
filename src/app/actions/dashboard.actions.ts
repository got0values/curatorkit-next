'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getDashboardData(): Promise<ServerResponseType> {
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

    let dashboardEvents = await prisma.event_calendar.findMany({
      where: {
        library: libraryId
      },
      include: {
        event_types: {
          select: {
            name: true
          }
        }
      }
    })

    let dashboardRegistrations = await prisma.event_form_data.findMany({
      where: {
        library: libraryId
      }
    })

    let referenceCount = await prisma.reference_count.findMany({
      where: {
        library: libraryId
      },
      include: {
        reference_count_departments: {
          select: {
            name: true
          }
        },
        reference_count_types: {
          select: {
            name: true
          }
        }
      }
    })

    let signIns = await prisma.signIns.findMany({
      where: {
        library: libraryId
      },
      include: {
        SignInLists: {
          select: {
            name: true
          }
        }
      }
    })

    let compSignIns = await prisma.compSignIns.findMany({
      where: {
        library: libraryId
      },
      include: {
        Computers: {
          select: {
            name: true
          }
        }
      }
    })

    let dashboardData = {
      events: dashboardEvents,
      registrations: dashboardRegistrations,
      referenceCount: referenceCount,
      roomSignIns: signIns,
      compSignIns: compSignIns
    }

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: dashboardData
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get dashboard data.", data: null}
  }
}