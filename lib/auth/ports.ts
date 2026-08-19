import type {
  IssuedSession,
  SessionPayload,
  SloSubject,
  SsoCallbackInput,
  User,
  UserId,
} from "./domain"

export interface SsoIdentityProvider {
  createLoginRedirect(relayState: string): Promise<string>
  authenticateResponse(input: SsoCallbackInput): Promise<User>
  createLogoutRedirect(subject: SloSubject): Promise<string>
  completeLogout(input: {
    samlRequest?: string
    samlResponse?: string
    originalQuery?: string
  }): Promise<string>
  getServiceProviderMetadata(): string
}

export interface SessionCipher {
  encrypt(payload: SessionPayload): Promise<string>
  decrypt(token: string | undefined): Promise<SessionPayload | null>
}

export interface SessionCookieStore {
  read(): Promise<string | undefined>
  write(token: string, expiresAt: Date): Promise<void>
  clear(): Promise<void>
}

export interface SessionService {
  issue(user: User): Promise<IssuedSession>
  create(user: User): Promise<void>
  read(): Promise<SessionPayload | null>
  destroy(): Promise<void>
}

export type { User, UserId, SessionPayload, SsoCallbackInput, IssuedSession }
