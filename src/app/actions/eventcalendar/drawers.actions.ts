'use server'

import {tokenCookieToLibraryId} from '../../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType, SignInType } from '../../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient();

export async function postRoom(roomName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!roomName) {
      return {success: false, message: "Please add a room name"}
    }

    await prisma.event_rooms.create({
      data: {
        library: libraryId,
        name: roomName
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to get add room"}
  }
}

export async function deleteRoom(roomId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!roomId) {
      return {success: false, message: "Please select a room to delete"}
    }
    
    await prisma.event_rooms.delete({
      where: {
        library: libraryId,
        id: Number(roomId)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to remove room"}
  }
}

export async function postType(typeName: string, typeColor: {hex: string, rgb: string}): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!typeName) {
      return {success: false, message: "Please add a type name"}
    }

    await prisma.event_types.create({
      data: {
        library: libraryId,
        name: typeName,
        color: JSON.stringify(typeColor)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to get add type"}
  }
}

export async function postTypeColor(typeId: string, typeColor: {hex: string, rgb: string}): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!typeId) {
      return {success: false, message: "Please select a type"}
    }

    await prisma.event_types.update({
      where: {
        library: libraryId,
        id: Number(typeId)
      },
      data: {
        color: JSON.stringify(typeColor)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to get add type color"}
  }
}

export async function deleteType(typeId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!typeId) {
      return {success: false, message: "Please select an event type to delete"}
    }
    
    await prisma.event_types.delete({
      where: {
        library: libraryId,
        id: Number(typeId)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to remove event type"}
  }
}

export async function postEquipment(equipmentName: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!equipmentName) {
      return {success: false, message: "Please add an equipment name"}
    }

    await prisma.event_equipment.create({
      data: {
        library: libraryId,
        name: equipmentName
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    await prisma.$disconnect();
    return {success: false, message: "Failed to get add equipment"}
  }
}

export async function deleteEquipment(equipmentId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!equipmentId) {
      return {success: false, message: "Please select an equipment to delete"}
    }
    
    await prisma.event_equipment.delete({
      where: {
        library: libraryId,
        id: Number(equipmentId)
      }
    })
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res);
    return {success: false, message: "Failed to remove equipment"}
  }
}