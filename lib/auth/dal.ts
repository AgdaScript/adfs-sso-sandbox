import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { LOGIN_PATH } from "./config"
import { auth } from "./container"
import { toPublicUser } from "./dto"
import type { PublicUser } from "./domain"

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await auth.sessions.read()

  if (!session) {
    return null
  }

  const user = await auth.users.findById(session.userId)

  if (!user) {
    return null
  }

  return toPublicUser(user)
})

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect(LOGIN_PATH)
  }

  return user
}
