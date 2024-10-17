'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function postLogout() {
  cookies().set({
    name: 'token',
    value: "",
    httpOnly: true,
    path: '/',
    maxAge: 0
  })
  redirect("/login")
}