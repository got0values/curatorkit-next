'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getCustomTheme(subdomain: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })
    const libraryId = library?.id;
    if (!libraryId) {
      return {success: false, message: "Failed to get library"}
    }

    let customizeFe = await prisma.customize_front_end.findFirst({
      where: {
        library: libraryId
      }
    })
    if (customizeFe?.primary_color) {
      customizeFe.primary_color = JSON.parse(customizeFe.primary_color)
    }
    if (customizeFe?.secondary_color) {
      customizeFe.secondary_color = JSON.parse(customizeFe.secondary_color)
    }
    if (customizeFe?.header_info) {
      customizeFe.header_info = JSON.parse(customizeFe.header_info);
    }
    
    let logo = await prisma.logos.findFirst({
      where: {
        library: libraryId
      },
      select: {
        logo_blob: true
      }
    })
    let logoBlob = logo?.logo_blob ? logo.logo_blob : null;
    
    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: {
        ...customizeFe,
        logo: logoBlob
      }
    }
  }
  catch (res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get theme", data: null}
  }
}