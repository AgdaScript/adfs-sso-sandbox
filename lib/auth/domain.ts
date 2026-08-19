export type UserId = string

export type User = {
  id: UserId
  name: string
  email: string
}

export type SessionPayload = {
  userId: UserId
  name: string
  email: string
}

export type PublicUser = {
  id: UserId
  name: string
  email: string
}

export type SsoCallbackInput = {
  samlResponse: string
  relayState?: string
}

export type IssuedSession = {
  token: string
  expiresAt: Date
}
