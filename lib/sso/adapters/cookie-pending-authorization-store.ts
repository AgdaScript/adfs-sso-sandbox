import "server-only"

import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

import { getSessionCookieOptions, getSessionSecret } from "@/lib/auth/config"
import { PENDING_OAUTH_COOKIE } from "../config"
import type { PendingAuthorization } from "../domain"
import type { PendingAuthorizationStore } from "../ports"

const encoder = new TextEncoder()

function key() {
  return encoder.encode(getSessionSecret())
}

export class CookiePendingAuthorizationStore implements PendingAuthorizationStore {
  async read(): Promise<PendingAuthorization | null> {
    const token = (await cookies()).get(PENDING_OAUTH_COOKIE)?.value
    if (!token) {
      return null
    }

    try {
      const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] })
      const clientId = payload.clientId
      const redirectUri = payload.redirectUri
      const state = payload.state

      if (
        typeof clientId !== "string" ||
        typeof redirectUri !== "string" ||
        typeof state !== "string"
      ) {
        return null
      }

      return { clientId, redirectUri, state }
    } catch {
      return null
    }
  }

  async write(pending: PendingAuthorization): Promise<void> {
    const token = await new SignJWT({ ...pending })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(key())

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    ;(await cookies()).set(PENDING_OAUTH_COOKIE, token, getSessionCookieOptions(expiresAt))
  }

  async clear(): Promise<void> {
    ;(await cookies()).set(PENDING_OAUTH_COOKIE, "", {
      ...getSessionCookieOptions(new Date(0)),
      maxAge: 0,
    })
  }
}
