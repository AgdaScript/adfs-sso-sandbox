import "server-only"

import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

import { getSessionCookieOptions, getSessionSecret } from "@/lib/auth/config"
import { LOGOUT_CHAIN_COOKIE } from "../config"
import type { LogoutChain } from "../domain"
import type { LogoutChainStore } from "../ports"

const encoder = new TextEncoder()

function key() {
  return encoder.encode(getSessionSecret())
}

export class CookieLogoutChainStore implements LogoutChainStore {
  async read(): Promise<LogoutChain | null> {
    const token = (await cookies()).get(LOGOUT_CHAIN_COOKIE)?.value
    if (!token) {
      return null
    }

    try {
      const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] })
      const remaining = Array.isArray(payload.remaining)
        ? payload.remaining.filter((item): item is string => typeof item === "string")
        : null
      const final = typeof payload.final === "string" ? payload.final : null

      if (!remaining || !final) {
        return null
      }

      return {
        remaining,
        final,
        nameID: typeof payload.nameID === "string" ? payload.nameID : undefined,
        nameIDFormat: typeof payload.nameIDFormat === "string" ? payload.nameIDFormat : undefined,
        sessionIndex: typeof payload.sessionIndex === "string" ? payload.sessionIndex : undefined,
      }
    } catch {
      return null
    }
  }

  async write(chain: LogoutChain): Promise<void> {
    const token = await new SignJWT({ ...chain })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(key())

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    ;(await cookies()).set(LOGOUT_CHAIN_COOKIE, token, getSessionCookieOptions(expiresAt))
  }

  async clear(): Promise<void> {
    ;(await cookies()).set(LOGOUT_CHAIN_COOKIE, "", {
      ...getSessionCookieOptions(new Date(0)),
      maxAge: 0,
    })
  }
}
