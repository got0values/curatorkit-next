'use server'

import {tokenCookieToLibraryId, tokenCookieToUserId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import { getCurrentUTCDateStart, getCurrentUTCDateEnd } from '../helpers/dateHelper';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getReferenceCountData(): Promise<ServerResponseType> {
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

    let libraryTimezone = library.timezone ? library.timezone : "US/Eastern";

    const currentUTCDateStart = getCurrentUTCDateStart();
    const currentUTCDateEnd = getCurrentUTCDateEnd();

    let referenceCount = [];
    referenceCount = await prisma.reference_count.findMany({
      where: {
        library: libraryId,
        datetime: {
          gte: currentUTCDateStart,
          lte: currentUTCDateEnd
        }
      },
      include: {
        reference_count_departments: true,
        reference_count_types: true
      }
    })
    for (var r of referenceCount) {
      r = {
        ...r,
        datetime: momentTimezone.utc(r.datetime).tz(libraryTimezone).toDate()
      }
    }

    let departments = await prisma.reference_count_departments.findMany({
      where: {
        library: libraryId
      }
    })

    let types = await prisma.reference_count_types.findMany({
      where: {
        library: libraryId
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        referenceCount,
        departments,
        types
      }
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get reference count", data: null}
  }
}

export async function postCreateReferenceCount(departmentId: string, typeId: string, notes: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    const userId = await tokenCookieToUserId();
    if (!userId) {
      return {success: false, message: "unauthorized"}
    }
    
    await prisma.reference_count.create({
      data: {
        user: Number(userId),
        library: libraryId,
        type: Number(typeId),
        department: Number(departmentId),
        notes: notes,
        datetime: new Date()
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to create reference count", data: null}
  }
}