import "server-only"

import { jwtVerify, SignJWT } from "jose"

import { getSessionSecret, SESSION_DURATION_MS } from "../config"
import type { SessionPayload } from "../domain"
import type { SessionCipher } from "../ports"

const encoder = new TextEncoder()

function getEncodedKey() {
  return encoder.encode(getSessionSecret())
}

function asSessionPayload(value: Record<string, unknown>): SessionPayload | null {
  const userId = value.userId
  const name = value.name
  const email = value.email

  if (
    typeof userId !== "string" ||
    userId.length === 0 ||
    typeof name !== "string" ||
    typeof email !== "string"
  ) {
    return null
  }

  return { userId, name, email }
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
      return asSessionPayload(payload as Record<string, unknown>)
    } catch {
      return null
    }
  }
}
