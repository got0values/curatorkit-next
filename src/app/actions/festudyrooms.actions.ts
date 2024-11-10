'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getStudyRoomsFe(subdomain: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    if (!library) {
      return {success: false, message: "Library not found"}
    }
    const libraryId = library.id;

    let rooms = await prisma.study_rooms.findMany({
      where: {
        library: libraryId
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success", data: {subdomain: subdomain, studyRooms: rooms}}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get study rooms"}
  }
}