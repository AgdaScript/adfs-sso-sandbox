"use server"

import { redirect } from "next/navigation"

import { LOGIN_PATH } from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export async function signOutAction(): Promise<void> {
  await auth.signOut()
  redirect(LOGIN_PATH)
}
