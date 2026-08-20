import type { SamlClaims } from "@/lib/auth/domain"

export type RegisteredClient = {
  id: string
  name: string
  secret: string
  redirectUris: string[]
  logoutUris: string[]
}

export type LogoutChain = {
  remaining: string[]
  final: string
  nameID?: string
  nameIDFormat?: string
  sessionIndex?: string
}

export type PendingAuthorization = {
  clientId: string
  redirectUri: string
  state: string
}

export type BrokerUser = {
  id: string
  name: string
  email: string
  sid?: string
  claims: SamlClaims
}

export type IssuedBrokerTokens = {
  accessToken: string
  idToken: string
  tokenType: "Bearer"
  expiresIn: number
}

export type AccessTokenClaims = {
  sub: string
  name: string
  email: string
  sid?: string
  claims: SamlClaims
  aud: string
  iss: string
}
