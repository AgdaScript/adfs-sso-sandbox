import type {
  AccessTokenClaims,
  BrokerUser,
  IssuedBrokerTokens,
  LogoutChain,
  PendingAuthorization,
  RegisteredClient,
} from "./domain"

export interface ClientRegistry {
  findById(clientId: string): RegisteredClient | null
  authenticate(clientId: string, clientSecret: string): RegisteredClient | null
  list(): RegisteredClient[]
}

export interface PendingAuthorizationStore {
  read(): Promise<PendingAuthorization | null>
  write(pending: PendingAuthorization): Promise<void>
  clear(): Promise<void>
}

export interface LogoutChainStore {
  read(): Promise<LogoutChain | null>
  write(chain: LogoutChain): Promise<void>
  clear(): Promise<void>
}

export interface AuthorizationCodeStore {
  issue(input: {
    clientId: string
    redirectUri: string
    user: BrokerUser
  }): Promise<string>
  consume(code: string): Promise<{
    clientId: string
    redirectUri: string
    user: BrokerUser
  } | null>
}

export interface TokenIssuer {
  issue(input: { user: BrokerUser; clientId: string }): Promise<IssuedBrokerTokens>
  verifyAccessToken(token: string | undefined): Promise<AccessTokenClaims | null>
}
