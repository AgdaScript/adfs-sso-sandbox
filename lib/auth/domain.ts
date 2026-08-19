export type UserId = string

export type User = {
  id: UserId
  name: string
  email: string
  nameID: string
  nameIDFormat: string
  sessionIndex?: string
}

export type SessionPayload = {
  userId: UserId
  name: string
  email: string
  nameID: string
  nameIDFormat: string
  sessionIndex?: string
}

export type PublicUser = {
  id: UserId
  name: string
  email: string
}

export type SloSubject = {
  nameID: string
  nameIDFormat: string
  sessionIndex?: string
}

export type SsoCallbackInput = {
  samlResponse: string
  relayState?: string
}

export type IssuedSession = {
  token: string
  expiresAt: Date
}
