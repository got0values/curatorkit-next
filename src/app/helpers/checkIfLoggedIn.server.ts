'use server'

import { PrismaClient } from '@prisma/client'
import {tokenCookieToUserId} from '../helpers/tokenCookieToUserId';

export default async function checkIfLoggedIn(): Promise<boolean> {
    const prisma = new PrismaClient();
    try {
      const userId = await tokenCookieToUserId();
      if (userId) {
        const user = await prisma.user.findUnique({
          where: {
            id: Number(userId)
          }
        })
        if (user) {
          return true;
        }
        return false
      }
      return false
    }
    catch (res) {
      console.error(res)
      return false
    }
  }