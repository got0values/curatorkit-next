'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';
import { getInputLibraryTimezoneDateStart, getInputLibraryTimezoneDateEnd } from '../helpers/dateHelper';

const prisma = new PrismaClient()

export async function getInHouseCheckoutItems(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    let items = await prisma.in_house_checkout_items.findMany({
      where: {
        library: libraryId
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: items}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get items", data: null}
  }
}

export async function getInHouseCheckoutHistory(item: string, inputDate1: string, inputDate2: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!item || !inputDate1 || !inputDate2) {
      return {success: false, message: "Failed to get checkouts"}
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

    let results = [];
    if (item === "All") {
      results = await prisma.in_house_checkout.findMany({
        where: {
          library: libraryId,
          checked_out: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          }
        }
      })
    }
    else {
      results = await prisma.in_house_checkout.findMany({
        where: {
          library: libraryId,
          checked_out: {
            gte: inputDate1UTC,
            lte: inputDate2UTC
          },
          item: Number(item)
        }
      })
    }

    let checkouts = [];
    for (var result of results) {
      let item = await prisma.in_house_checkout_items.findUnique({
        where: {
          library: libraryId,
          id: result.item
        }
      })
      checkouts.push({
        ...result,
        itemName: item?.name,
        checked_out: momentTimezone(result.checked_out).tz(libraryTimezone).toDate(),
        returned: momentTimezone(result.returned).tz(libraryTimezone).toDate()
      })
    }
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: checkouts}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get checkouts", data: null}
  }
}