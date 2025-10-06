'use server'

import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";
import {SignJWT} from 'jose';
import { ServerResponseType } from '../types/types';
import { cookies } from 'next/headers';
import { validateEmail, validateRequired } from '../utils/validation';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

const prisma = new PrismaClient()
const SECRET = process.env.SECRET;

export async function postLogin(formData: FormData): Promise<ServerResponseType> {
  try {
    const email = formData.get("email")?.valueOf() as string
    const password = formData.get("password")?.valueOf() as string
    
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, message: emailValidation.message || 'Invalid email' }
    }
    
    const passwordValidation = validateRequired(password, 'Password')
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.message || 'Password is required' }
    }
    
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },

    });
    
    if (!user) {
      console.warn(`Login attempt with invalid email: ${email}`)
      return {success: false, message: "Invalid email or password"}
    }
    if (!user.password) {
      console.error(`User ${user.id} has no password set`)
      return {success: false, message: "Account setup incomplete. Please contact support."}
    }
    
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`Failed login attempt for user: ${user.email}`)
      return {success: false, message: "Invalid email or password"}
    }
    
    if (!SECRET) {
      console.error('JWT SECRET is not configured')
      return {success: false, message: ERROR_MESSAGES.SERVER_ERROR}
    }

    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(SECRET));
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60
    })
    return {success: true, message: SUCCESS_MESSAGES.CREATED}
  }
  catch(error) {
    console.error('Login error:', error)
    return {success: false, message: ERROR_MESSAGES.SERVER_ERROR}
  }
  finally {
    await prisma.$disconnect();
  }
}