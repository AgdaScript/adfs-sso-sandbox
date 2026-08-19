"use server"

import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/container"

export async function signOutAction(): Promise<void> {
  const { redirectTo } = await auth.signOut()
  redirect(redirectTo)
}
