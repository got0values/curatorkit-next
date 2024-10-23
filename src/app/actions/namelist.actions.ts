'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getNameList(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    var namelist = await prisma.namelist.findMany({
      where: {
        library: libraryId
      },
      select: {
        card: true,
        name: true
      }
    })

    return {success: true, message: "Success", data: namelist}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get room namelist", data: null}
  }
}

export async function postAddCard(card:string,name:string): Promise<ServerResponseType> {
  try {
    if (card === "" || card === null) {
      return {success: false, message: "Please add a card number"}
    }

    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.namelist.deleteMany({
      where: {
        AND: [
          {
            library: libraryId
          },
          {
            card: card
          }
        ]
      }
    })

    await prisma.namelist.create({
      data: {
        library: libraryId,
        card: card,
        name: name
      }
    })

    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to input to namelist", data: null}
  }
}

export async function postAddCards(csvData: any[]): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    csvData.forEach(async ({barcode, name}: {barcode: string,name: string}) => {
      if (barcode != "") {
        await prisma.namelist.deleteMany({
          where: {
            AND: [
              {
                library: libraryId
              },
              {
                card: barcode
              }
            ]
          }
        })
        await prisma.namelist.create({
          data: {
            library: libraryId,
            card: barcode,
            name: name
          }
        })
      }
    })

    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to input to namelist", data: null}
  }
}

export async function deleteCard(card:string): Promise<ServerResponseType> {
  try {
    if (card === "" || card === null) {
      return {success: false, message: "Please add a card number"}
    }

    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.namelist.deleteMany({
      where: {
        AND: [
          {
            library: libraryId
          },
          {
            card: card
          }
        ]
      }
    })

    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to input to namelist", data: null}
  }
}