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

  return {
    userId,
    name,
    email,
    nameID: typeof value.nameID === "string" && value.nameID ? value.nameID : userId,
    nameIDFormat:
      typeof value.nameIDFormat === "string" && value.nameIDFormat
        ? value.nameIDFormat
        : "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
    sessionIndex:
      typeof value.sessionIndex === "string" && value.sessionIndex
        ? value.sessionIndex
        : undefined,
    sid: typeof value.sid === "string" && value.sid ? value.sid : undefined,
    claims: asClaims(value.claims),
  }
}

function asClaims(value: unknown): SessionPayload["claims"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const claims: SessionPayload["claims"] = {}

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      claims[key] = raw
    } else if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
      claims[key] = raw
    }
  }

  return claims
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
