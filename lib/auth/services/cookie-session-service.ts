import "server-only"

import { SESSION_DURATION_MS } from "../config"
import type { SessionPayload, UserId } from "../domain"
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

  async create(userId: UserId): Promise<void> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const token = await this.cipher.encrypt({ userId })
    await this.cookies.write(token, expiresAt)
  }

  async read(): Promise<SessionPayload | null> {
    const token = await this.cookies.read()
    return this.cipher.decrypt(token)
  }

  async destroy(): Promise<void> {
    await this.cookies.clear()
  }
}
