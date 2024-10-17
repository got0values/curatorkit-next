'use server'

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { PrismaClient } from '@prisma/client';

export async function tokenCookieToUserId() {
  const SECRET = process.env.SECRET;
  try {
    const tokenCookie = cookies().get("token")
    if (!tokenCookie) {
      throw new Error("Failed")
    }
    const {payload} = await jwtVerify(tokenCookie.value, new TextEncoder().encode(SECRET));
    return payload.userId;
  } catch (error) {
      console.error(error)
  }
};

export async function tokenCookieToLibraryId() {
  const prisma = new PrismaClient()
  try {
    var userId = await tokenCookieToUserId();
    if (!userId) {
      return null;
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId)
      },
      select: {
        library: true
      }
    })
    return user?.library;
  } catch (error) {
      console.error(error)
  }
};