'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ReferenceCountType, ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';
import { getInputLibraryTimezoneDateEnd, getInputLibraryTimezoneDateStart } from '../helpers/dateHelper';

const prisma = new PrismaClient()

export async function getRefCountTypes(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    let types = await prisma.reference_count_types.findMany({
      where: {
        library: libraryId
      }
    })

    let departments = await prisma.reference_count_departments.findMany({
      where: {
        library: libraryId
      }
    })
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        types,
        departments
      }
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get types", data: null}
  }
}

export async function getReferenceCountHistory(department: string, type: string, inputDate1: string, inputDate2: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!department || !type || !inputDate1 || !inputDate2) {
      return {success: false, message: "Failed to get reference count"}
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

    let results: any[] | [] = [];
    if (department === "All" && type === "All") {
      results = await prisma.reference_count.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          }
        },
        include: {
          reference_count_departments: true,
          reference_count_types: true,
          user_reference_count_userTouser: {
            select: {
              email: true
            }
          }
        }
      })
    }
    else if (department !== "All" && type === "All"){
      results = await prisma.reference_count.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          },
          department: Number(department)
        },
        include: {
          reference_count_departments: true,
          reference_count_types: true,
          user_reference_count_userTouser: {
            select: {
              email: true
            }
          }
        }
      })
    }
    else if (department === "All" && type !== "All"){
      results = await prisma.reference_count.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          },
          type: Number(type)
        },
        include: {
          reference_count_departments: true,
          reference_count_types: true,
          user_reference_count_userTouser: {
            select: {
              email: true
            }
          }
        }
      })
    }
    else if (department !== "All" && type !== "All"){
      results = await prisma.reference_count.findMany({
        where: {
          library: libraryId,
          datetime: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          },
          department: Number(department),
          type: Number(type)
        },
        include: {
          reference_count_departments: true,
          reference_count_types: true,
          user_reference_count_userTouser: {
            select: {
              email: true
            }
          }
        }
      })
    }

    let refCounts = [];
    for (var result of results) {
      refCounts.push({
        ...result,
        datetime: momentTimezone(result.datetime).tz(libraryTimezone).toDate()
      })
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: refCounts}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get reference count", data: null}
  }
}