'use server'

import {tokenCookieToUserId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import { sendEmail } from '../utils/sendEmail';

const prisma = new PrismaClient()

export async function postSupportRequest(email: string, message: string): Promise<ServerResponseType> {
  try {
    const userId = await tokenCookieToUserId();
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId)
      }
    })

    const htmlBody = `
      <div>
        A user is asking for help.
      </div>
      <div>
        User email: ${user?.email}
      </div>
      <div>
        Message Form email: ${email}
      </div>
      <div>
        Message:
      </div>
      <div>
        ${message}
      </div>
    `
    let sendEmailresponse = await sendEmail("admin@curatorkit.com", "Help Request", htmlBody)

    if (!sendEmailresponse.success) {
      return {success: false, message: "Support request failed"};
    }

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success"
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to send support request.", data: null}
  }
}