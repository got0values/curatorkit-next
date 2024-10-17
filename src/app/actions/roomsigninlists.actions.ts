'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInListType } from '../types/types';

const prisma = new PrismaClient()

export async function getRoomList(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    const signInLists: SignInListType[] = await prisma.signInLists.findMany({
      where: {
        library: Number(libraryId)
      },
      select: {
        id: true,
        name: true
      }
    })

    return {success: true, message: "Success", data: signInLists}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get library admin pw"}
  }
}

export async function postAddRoomList(roomName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.signInLists.create({
      data: {
        library: Number(libraryId),
        name: roomName
      }
    })

    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to get library admin pw"}
  }
}

export async function deleteRoom(roomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.signInLists.delete({
      where: {
        library: Number(libraryId),
        id: Number(roomId)
      }
    })

    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to delete room"}
  }
}