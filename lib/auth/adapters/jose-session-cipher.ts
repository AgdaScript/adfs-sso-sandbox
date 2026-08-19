import "server-only"

import { jwtVerify, SignJWT } from "jose"

import { getSessionSecret, SESSION_DURATION_MS } from "../config"
import type { SessionPayload } from "../domain"
import type { SessionCipher } from "../ports"

const encoder = new TextEncoder()

function getEncodedKey() {
  return encoder.encode(getSessionSecret())
}

export class JoseSessionCipher implements SessionCipher {
  async encrypt(payload: SessionPayload): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
      .sign(getEncodedKey())
  }

  async decrypt(token: string | undefined): Promise<SessionPayload | null> {
    if (!token) {
      return null
    }

    try {
      const { payload } = await jwtVerify(token, getEncodedKey(), {
        algorithms: ["HS256"],
      })
      const userId = payload.userId

      if (typeof userId !== "string" || userId.length === 0) {
        return null
      }

      return { userId }
    } catch {
      return null
    }
  }
}
