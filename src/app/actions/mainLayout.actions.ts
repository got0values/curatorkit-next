'use server'

import {tokenCookieToUserId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getUser(): Promise<ServerResponseType> {
  try {
    const userId = await tokenCookieToUserId();
    if (!userId) {
      return {success: false, message: "unauthorized"}
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId)
      },
      select: {
        email: true,
        library: true
      }
    })
    const library = await prisma.library.findUnique({
      where: {
        id: user?.library
      }
    })
    const userWithLibrary = {...user, Library: library}
    await prisma.$disconnect();
    return {success: true, message: "Success", data: userWithLibrary}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get user"}
  }
}