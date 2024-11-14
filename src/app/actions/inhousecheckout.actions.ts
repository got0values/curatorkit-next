'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getInHouseCheckouts(): Promise<ServerResponseType> {
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
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');
    const currentDateStart = momentTimezone.tz(currentDate + ' 00:00:00', libraryTimezone!).toDate()
    const currentDateEnd = momentTimezone.tz(currentDate + ' 23:59:59', libraryTimezone!).toDate()

    let items = await prisma.in_house_checkout_items.findMany({
      where: {
        library: libraryId
      }
    })

    let checkoutResults = await prisma.in_house_checkout.findMany({
      where: {
        library: libraryId,
        checked_out: {
          gte: currentDateStart,
          lt: currentDateEnd
        }
      },
      orderBy: {
        checked_out: "desc"
      }
    })

    let checkouts = [];
    for (let result of checkoutResults) {
      let itemResult = await prisma.in_house_checkout_items.findUnique({
        where: {
          id: result.item
        },
        select: {
          name: true
        }
      })
      checkouts.push({
        ...result,
        item: itemResult?.name,
        checked_out: momentTimezone(result.checked_out).tz(libraryTimezone).toDate(),
        returned: momentTimezone(result.returned).tz(libraryTimezone).toDate()
      })
    }
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        items: items,
        checkouts: checkouts
      }
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to add item/", data: null}
  }
}

export async function postCreateInHouseCheckoutItem(itemName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!itemName) {
      return {success: false, message: "Please enter an item name"}
    }

    await prisma.in_house_checkout_items.create({
      data: {
        library: libraryId,
        name: itemName
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to add item", data: null}
  }
}

export async function deleteInHouseCheckoutItem(itemToDelete: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!itemToDelete) {
      return {success: false, message: "Failed to delete item"}
    }

    await prisma.in_house_checkout_items.delete({
      where: {
        library: libraryId,
        id: Number(itemToDelete)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete item", data: null}
  }
}

export async function postCheckoutItem(card: string, itemId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!card) {
      return {success: false, message: "Please enter a card or name"}
    }
    if (!itemId) {
      return {success: false, message: "Please select an item"}
    }

    await prisma.in_house_checkout.create({
      data: {
        library: libraryId,
        item: Number(itemId),
        checked_out: new Date(),
        card: card
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to checkout item", data: null}
  }
}

export async function postReturnItem(checkoutId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!checkoutId) {
      return {success: false, message: "Please select a checkout"}
    }

    await prisma.in_house_checkout.update({
      where: {
        id: Number(checkoutId)
      },
      data: {
        returned: new Date()
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to return item", data: null}
  }
}

export async function deleteInHouseCheckout(checkoutId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!checkoutId) {
      return {success: false, message: "Please select a checkout"}
    }

    await prisma.in_house_checkout.delete({
      where: {
        library: libraryId,
        id: Number(checkoutId)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete checkout", data: null}
  }
}