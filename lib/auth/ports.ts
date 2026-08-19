import type { Credentials, SessionPayload, User, UserId } from "./domain"

export type UserCredentials = {
  user: User
  passwordHash: string
}

export interface Authenticator {
  authenticate(credentials: Credentials): Promise<User | null>
}

export interface UserReader {
  findById(id: UserId): Promise<User | null>
}

export interface CredentialLookup {
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>
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
  create(userId: UserId): Promise<void>
  read(): Promise<SessionPayload | null>
  destroy(): Promise<void>
}
