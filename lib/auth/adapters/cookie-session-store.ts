import "server-only"

import { cookies } from "next/headers"

import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "../config"
import type { SessionCookieStore } from "../ports"

export class CookieSessionStore implements SessionCookieStore {
  async read(): Promise<string | undefined> {
    const store = await cookies()
    return store.get(SESSION_COOKIE_NAME)?.value
  }

  async write(token: string, expiresAt: Date): Promise<void> {
    const store = await cookies()
    store.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt))
  }

  async clear(): Promise<void> {
    const store = await cookies()
    store.set(SESSION_COOKIE_NAME, "", {
      ...getSessionCookieOptions(new Date(0)),
      maxAge: 0,
    })
  }
}
