'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getLibraryName(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    var library = await prisma.library.findUnique({
      where: {
        id: libraryId
      },
      select: {
        name: true
      }
    })

    await prisma.$disconnect();
    return {success: true, message: "Success", data: library?.name}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get library name", data: null}
  }
}