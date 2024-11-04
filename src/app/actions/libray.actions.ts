'use server'

import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()

export async function getLibraryNameFromSubdomain(subdomain: string): Promise<ServerResponseType> {
  try {
    const library = await prisma.library.findFirst({
      where: {
        subdomain: subdomain
      }
    })

    await prisma.$disconnect();
    return {success: true, message: "Success", data: library?.name}
  }
  catch (res) {
    console.error(res)
    return {success: false, message: "Failed to get library name", data: null}
  }
}