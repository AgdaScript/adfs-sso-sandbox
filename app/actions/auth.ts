"use server"

import { redirect } from "next/navigation"

import { OAUTH_LOGOUT_PATH } from "@/lib/sso/config"

export async function signOutAction(): Promise<void> {
  redirect(OAUTH_LOGOUT_PATH)
}
