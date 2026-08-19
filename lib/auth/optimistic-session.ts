import "server-only"

import { JoseSessionCipher } from "./adapters/jose-session-cipher"
import { SESSION_COOKIE_NAME } from "./config"
import type { SessionPayload } from "./domain"

const cipher = new JoseSessionCipher()

export async function readOptimisticSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  return cipher.decrypt(token)
}

export { SESSION_COOKIE_NAME }
