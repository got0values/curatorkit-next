'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getCustomizeFe(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      }
    })

    const subdomain = library?.subdomain;

    let customFe = await prisma.customize_front_end.findFirst({
      where: {
        library: libraryId
      }
    })
    if (customFe){
      if (customFe.primary_color) {
        customFe.primary_color = JSON.parse(customFe.primary_color);
      }
      if (customFe.secondary_color) {
        customFe.secondary_color = JSON.parse(customFe.secondary_color);
      }
      if (customFe.header_info) {
        customFe.header_info = JSON.parse(customFe.header_info);
      }
    }

    let logo = await prisma.logos.findFirst({
      where: {
        library: libraryId
      }
    })
    let logoBlob = logo?.logo_blob;

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        ...customFe,
        logoBlob,
        subdomain
      }
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get front end customizations.", data: null}
  }
}

export async function postSaveCustomizeFe(formData: FormData): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    const allowDarkMode = formData.get("allowDarkMode")?.valueOf() === "on" ? true : false;
    const primaryColor = formData.get("primaryColor")?.valueOf() as string
    const secondaryColor = formData.get("secondaryColor")?.valueOf() as string
    const logoData = formData.get("logoData")?.valueOf() as string
    const headerInfo = formData.get("headerInfo")?.valueOf() as string
    const url = formData.get("url")?.valueOf() as string
    const eventCalendarShow = formData.get("eventCalendarShow")?.valueOf() === "on" ? true : false;
    const requestStudyRoomShow = formData.get("requestStudyRoomShow")?.valueOf() === "on" ? true : false;
    const readingClubShow = formData.get("readingClubShow")?.valueOf() === "on" ? true : false;
    const bigCalendarView = formData.get("bigCalendarView")?.valueOf() === "on" ? true : false;
    const keepAccorionsOpen = formData.get("keepAccordionsOpen")?.valueOf() === "on" ? true : false;

    const customFeExists = await prisma.customize_front_end.findFirst({
      where: {
        library: libraryId
      }
    })
    if (customFeExists) {
      await prisma.customize_front_end.deleteMany({
        where: {
          library: libraryId
        }
      })
    }
    
    await prisma.customize_front_end.create({
      data: {
        library: libraryId,
        big_calendar_view: bigCalendarView,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        library_url: url,
        allow_dark_mode: allowDarkMode,
        header_info: headerInfo,
        keep_accordions_open: keepAccorionsOpen,
        show_event_calendar: eventCalendarShow,
        show_request_study_room: requestStudyRoomShow,
        show_reading_club: readingClubShow
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
    return {success: false, message: "Failed to save front end customization.", data: null}
  }
}