'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

/**
 * Retrieves comprehensive dashboard data for analytics and reporting
 * 
 * This function aggregates data from multiple sources including:
 * - Event calendar entries with associated event types
 * - Event registrations with type information  
 * - Reference count entries with department and type details
 * - Room sign-ins with associated room lists
 * - Computer sign-ins with computer information
 * 
 * @returns Promise that resolves to success response with dashboard data or error response
 * @throws Database connection errors or query failures
 * @requires Valid authentication token in cookies
 * @requires Library access permissions
 */
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

    const dashboardEvents = await prisma.event_calendar.findMany({
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

    const dashboardRegistrations = await prisma.event_form_data.findMany({
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

    const referenceCount = await prisma.reference_count.findMany({
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

    const signIns = await prisma.signIns.findMany({
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

    const compSignIns = await prisma.compSignIns.findMany({
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

    const dashboardData = {
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
  catch(error) {
    console.error('Error in getDashboardData:', error)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get dashboard data.", data: null}
  }
}