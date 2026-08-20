import "server-only"

import { randomBytes } from "node:crypto"

import { AUTHORIZATION_CODE_TTL_MS } from "../config"
import type { BrokerUser } from "../domain"
import type { AuthorizationCodeStore } from "../ports"

type StoredCode = {
  clientId: string
  redirectUri: string
  user: BrokerUser
  expiresAt: number
}

declare global {
  var __ssoAuthorizationCodes: Map<string, StoredCode> | undefined
}

function codes(): Map<string, StoredCode> {
  globalThis.__ssoAuthorizationCodes ??= new Map()
  return globalThis.__ssoAuthorizationCodes
}

export class MemoryAuthorizationCodeStore implements AuthorizationCodeStore {
  async issue(input: {
    clientId: string
    redirectUri: string
    user: BrokerUser
  }): Promise<string> {
    const code = randomBytes(32).toString("base64url")
    codes().set(code, {
      ...input,
      expiresAt: Date.now() + AUTHORIZATION_CODE_TTL_MS,
    })
    return code
  }

  async consume(code: string): Promise<{
    clientId: string
    redirectUri: string
    user: BrokerUser
  } | null> {
    const stored = codes().get(code)
    codes().delete(code)

    if (!stored || stored.expiresAt < Date.now()) {
      return null
    }

    return {
      clientId: stored.clientId,
      redirectUri: stored.redirectUri,
      user: stored.user,
    }
  }
}
