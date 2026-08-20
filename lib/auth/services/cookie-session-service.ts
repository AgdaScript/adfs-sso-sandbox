import "server-only"

import { randomBytes } from "node:crypto"

import { SESSION_DURATION_MS } from "../config"
import type { IssuedSession, SessionPayload, User } from "../domain"
import type {
  SessionCipher,
  SessionCookieStore,
  SessionService,
  SidRevocationStore,
} from "../ports"

export class CookieSessionService implements SessionService {
  constructor(
    private readonly cipher: SessionCipher,
    private readonly cookies: SessionCookieStore,
    private readonly revocation: SidRevocationStore,
  ) {}

  async issue(user: User): Promise<IssuedSession> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const token = await this.cipher.encrypt({
      userId: user.id,
      name: user.name,
      email: user.email,
      nameID: user.nameID,
      nameIDFormat: user.nameIDFormat,
      sessionIndex: user.sessionIndex,
      sid: randomBytes(32).toString("base64url"),
      claims: user.claims,
    })

    return { token, expiresAt }
  }

  async create(user: User): Promise<void> {
    const issued = await this.issue(user)
    await this.cookies.write(issued.token, issued.expiresAt)
  }

  async read(): Promise<SessionPayload | null> {
    const token = await this.cookies.read()
    const session = await this.cipher.decrypt(token)
    if (session?.sid && this.revocation.isRevoked(session.sid)) {
      return null
    }
    return session
  }

  async destroy(): Promise<void> {
    const token = await this.cookies.read()
    const session = await this.cipher.decrypt(token)
    if (session?.sid) {
      this.revocation.revoke(session.sid)
    }
    await this.cookies.clear()
  }
}
