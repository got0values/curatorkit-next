'use server'

import { PrismaClient } from '@prisma/client'
import validator from 'validator';
import passwordValidator from "password-validator";
import bcrypt from "bcrypt";
import {SignJWT} from 'jose';
import { cookies } from 'next/headers';
import { ServerResponseType } from '../types/types';

const prisma = new PrismaClient()
const SALT_ROUNDS = 10;
const SECRET = process.env.SECRET;

export async function postRegister(formData: FormData): Promise<ServerResponseType> {
  try {
    const email = formData.get('email')?.valueOf() as string
    const password = formData.get('password')?.valueOf() as string
    const confirm_password = formData.get('confirm_password')?.valueOf() as string

    //check if existing email address
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      await prisma.$disconnect();
      console.error(`Email already exists: ${email}`)
      return {success: false, message: "Email already exists"}
    }

    if (!validator.isEmail(email)) {
      await prisma.$disconnect();
      console.error(`Email not valid: ${email}`)
      return {success: false, message: "Email not valid"}
    }

    //check if the password and confirm passwords match
    if (password !== confirm_password) {
      await prisma.$disconnect();
      console.error(`Passwords don't match: ${password} ${confirm_password}`)
      return {success: false, message: "Passwords must match"}
    }

    //password validation
    var schema = new passwordValidator();
    schema
      .is().min(8)// Minimum length 8
      .is().max(100)// Maximum length 100
      .has().uppercase()// Must have uppercase letters
      .has().lowercase()// Must have lowercase letters
      .has().digits(2)// Must have at least 2 digits
      .has().symbols(1)
      .has().not().spaces()// Should not have spaces
    const pwValidationErrors = schema.validate(password, {details:true})
    if ((pwValidationErrors as any[]).length) {
      await prisma.$disconnect();
      console.error(`Password validation error ${(pwValidationErrors as any[])[0].message}`)
      return {success: false, message: (pwValidationErrors as any[])[0].message}
    }

    let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        library: 1,
        created_on: new Date()
      }
    });

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
    var response = {success: true, message: "Success!"}
    return response;
  }
  catch(error) {
    await prisma.$disconnect();
    console.error(error)
    return {success: false, message: "Something went wrong"}
  }
  finally {
    await prisma.$disconnect();
  }
}