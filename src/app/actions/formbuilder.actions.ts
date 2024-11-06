'use server'

import { tokenCookieToLibraryId } from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import moment from 'moment';
import { EventFormType } from '../types/types';

const prisma = new PrismaClient()

export async function getEventForms(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    let formResults = await prisma.event_forms.findMany({
      where: {
        library: libraryId
      }
    })
    for (let formResult of formResults) {
      if (formResult.date_created) {
        formResult.date_created = moment(formResult.date_created).format("MM/DD/YYYY, HH:mm:ss") as unknown as Date;
      }
    }
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: formResults
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get forms", data: null}
  }
}

export async function postSaveForms(eventForm: EventFormType): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.event_forms.create({
      data: {
        library: libraryId,
        form_schema: eventForm.form_schema,
        form_ui_schema: eventForm.form_ui_schema,
        attendees: eventForm?.attendees ? Number(eventForm.attendees) : 0,
        waitinglist: eventForm?.waitinglist ? Number(eventForm.waitinglist) : 0
      }
    })
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save form", data: null}
  }
}

export async function deleteEventForm(formToDelete: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    await prisma.event_forms.delete({
      where: {
        id: Number(formToDelete)
      }
    })
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete form", data: null}
  }
}