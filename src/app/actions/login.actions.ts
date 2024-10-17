'use server'

import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";
import {SignJWT} from 'jose';
import validator from 'validator';
import { ServerResponseType } from '../types/types';
import { cookies } from 'next/headers';

const prisma = new PrismaClient()
const SECRET = process.env.SECRET;
const SALT_ROUNDS = 10;

export async function postLogin(formData: FormData): Promise<ServerResponseType> {
  try {
    const email = formData.get("email")?.valueOf() as string
    const password = formData.get("password")?.valueOf() as string
    
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (!user) {
      await prisma.$disconnect();
      console.error(`Incorrect email or password ${email} ${password}`)
      return {success: false, message: "Incorrect email or password"}
    }
    if (user.password === null || user.password === "") {
      await prisma.$disconnect();
      console.error(`No password found for user`)
      return {success: false, message: "Error: P1"}
    }
    //compare the provided password with the hashed password in the database
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      await prisma.$disconnect();
      console.error(`Password incorrect: ${password}`)
      return {success: false, message: "Email or password is incorrect"}
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
    await prisma.$disconnect();
    return {success: true, message: "Success!"}
  }
  catch(error) {
    console.error(error)
    await prisma.$disconnect();
    return {success: false, message: "Something went wrong"}
  }
  finally {
    await prisma.$disconnect();
  }
}