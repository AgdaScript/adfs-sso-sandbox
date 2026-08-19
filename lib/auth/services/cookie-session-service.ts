import "server-only"

import { SESSION_DURATION_MS } from "../config"
import type { IssuedSession, SessionPayload, User } from "../domain"
import type {
  SessionCipher,
  SessionCookieStore,
  SessionService,
} from "../ports"

export class CookieSessionService implements SessionService {
  constructor(
    private readonly cipher: SessionCipher,
    private readonly cookies: SessionCookieStore,
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
    return this.cipher.decrypt(token)
  }

  async destroy(): Promise<void> {
    await this.cookies.clear()
  }
}
