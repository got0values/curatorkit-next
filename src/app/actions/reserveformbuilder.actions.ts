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

export async function postSaveReserveForm(reserveSchema: string, reserveUiSchema: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.reserve_forms.create({
      data: {
        library: libraryId,
        title: JSON.parse(reserveSchema).title,
        form_schema: reserveSchema,
        form_ui_schema: reserveUiSchema,
        date_created: new Date()
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save form"}
  }
}

export async function deleteReserveForm(formToDelete: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.reserve_forms.delete({
      where: {
        id: Number(formToDelete)
      }
    })
    
    await prisma.$disconnect();
    return {success: true, message: "Success"}
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get delete form"}
  }
}