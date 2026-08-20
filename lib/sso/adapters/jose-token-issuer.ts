import "server-only"

import { jwtVerify, SignJWT } from "jose"

import { getSessionSecret } from "@/lib/auth/config"
import type { SamlClaims } from "@/lib/auth/domain"
import { ACCESS_TOKEN_TTL_SECONDS, getSsoIssuer } from "../config"
import type { AccessTokenClaims, BrokerUser, IssuedBrokerTokens } from "../domain"
import type { TokenIssuer } from "../ports"

const encoder = new TextEncoder()

function key() {
  return encoder.encode(getSessionSecret())
}

export class JoseTokenIssuer implements TokenIssuer {
  async issue(input: { user: BrokerUser; clientId: string }): Promise<IssuedBrokerTokens> {
    const issuer = getSsoIssuer()
    const accessToken = await new SignJWT({
      sub: input.user.id,
      name: input.user.name,
      email: input.user.email,
      claims: input.user.claims,
      typ: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(issuer)
      .setAudience(input.clientId)
      .setSubject(input.user.id)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(key())

    const idToken = await new SignJWT({
      sub: input.user.id,
      name: input.user.name,
      email: input.user.email,
      claims: input.user.claims,
      typ: "id",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(issuer)
      .setAudience(input.clientId)
      .setSubject(input.user.id)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(key())

    return {
      accessToken,
      idToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    }
  }

  async verifyAccessToken(token: string | undefined): Promise<AccessTokenClaims | null> {
    if (!token) {
      return null
    }

    try {
      const { payload } = await jwtVerify(token, key(), {
        algorithms: ["HS256"],
        issuer: getSsoIssuer(),
      })

      if (payload.typ !== "access") {
        return null
      }

      const sub = typeof payload.sub === "string" ? payload.sub : null
      const name = typeof payload.name === "string" ? payload.name : null
      const email = typeof payload.email === "string" ? payload.email : null
      const aud = typeof payload.aud === "string" ? payload.aud : null
      const iss = typeof payload.iss === "string" ? payload.iss : null

      if (!sub || !name || !email || !aud || !iss) {
        return null
      }

      return {
        sub,
        name,
        email,
        aud,
        iss,
        claims: asClaims(payload.claims),
      }
    } catch {
      return null
    }
  }
}

function asClaims(value: unknown): SamlClaims {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const claims: SamlClaims = {}

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      claims[key] = raw
    } else if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
      claims[key] = raw
    }
  }

  return claims
}
