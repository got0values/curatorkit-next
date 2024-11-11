'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getReserveForms(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    let forms = await prisma.reserve_forms.findMany({
      where: {
        library: libraryId,
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: forms}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get reserve forms"}
  }
}