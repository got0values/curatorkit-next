'use server'

import {tokenCookieToLibraryId} from '../../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../../types/types';

const prisma = new PrismaClient()

export async function getEventFormsData(formId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    if (!formId) {
      return {success: false, message: "Failed to get forms."}
    }
    
    let eventForm = await prisma.event_forms.findUnique({
      where: {
        library: libraryId,
        id: Number(formId)
      }
    })
    if (!eventForm) {
      return {success: false, message: "Form does not exist"}
    }
    let eventFormDatas = await prisma.event_form_data.findMany({
      where: {
        library: libraryId,
        form_id: eventForm.id
      }
    })
    let attendees = eventForm.attendees;
    let waitingList = eventForm.waitinglist;

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        formData: eventFormDatas,
        attendees: attendees,
        waitingList: waitingList
      }
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get event forms.", data: null}
  }
}

export async function getFormSchema(eventFormId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    let formSchema = await prisma.event_forms.findFirst({
      where: {
        library: libraryId,
        id: Number(eventFormId)
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        schema: formSchema?.form_schema,
        uiSchema: formSchema?.form_ui_schema
      }
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get event forms.", data: null}
  }
}

export async function postEventFormsBackend(regFormData: string ,regFormId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!regFormId) {
      return {success: false, message: "Failed to find form."}
    }

    await prisma.event_form_data.update({
      where: {
        library: libraryId,
        id: Number(regFormId)
      },
      data: {
        form_data: regFormData
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save registration form.", data: null}
  }
}

export async function postEventFormsBackendNew(regFormData: string, formId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!formId) {
      return {success: false, message: "Failed to find form."}
    }

    await prisma.event_form_data.create({
      data: {
        library: libraryId,
        form_id: Number(formId),
        form_data: regFormData,
        datetime: new Date()
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to save registration form.", data: null}
  }
}

export async function deleteEventFormData(formDataId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!formDataId) {
      return {success: false, message: "Failed to delete form."}
    }

    await prisma.event_form_data.delete({
      where: {
        id: Number(formDataId)
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to delete registration form.", data: null}
  }
}

export async function putUpdateEventFormAttendees(attendees: string, waitingList: string, formId: string): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    if (!formId ) {
      return {success: false, message: "Failed to update form."}
    }

    await prisma.event_forms.update({
      where: {
        id: Number(formId)
      },
      data: {
        attendees: attendees ? Number(attendees) : 0,
        waitinglist: waitingList ? Number(waitingList) : 0
      }
    })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to update form.", data: null}
  }
}
