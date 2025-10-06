'use server'

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { PrismaClient } from '@prisma/client';

/**
 * Extracts and validates user ID from JWT token stored in cookies
 * 
 * @returns {Promise<string|number|undefined>} User ID from token payload, or undefined if invalid
 * @throws {Error} When JWT verification fails or SECRET is not configured
 */
export async function tokenCookieToUserId() {
  const SECRET = process.env.SECRET;
  try {
    const tokenCookie = cookies().get("token")
    if (!tokenCookie) {
      throw new Error("No token cookie found")
    }
    const {payload} = await jwtVerify(tokenCookie.value, new TextEncoder().encode(SECRET));
    return payload.userId;
  } catch (error) {
      console.error('Token verification failed:', error)
      return undefined;
  }
};

/**
 * Retrieves the library ID associated with the authenticated user
 * 
 * @returns {Promise<number|null>} Library ID for the authenticated user, or null if not found
 * @throws {Error} Database connection errors or user lookup failures
 */
export async function tokenCookieToLibraryId() {
  const prisma = new PrismaClient()
  try {
    const userId = await tokenCookieToUserId();
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