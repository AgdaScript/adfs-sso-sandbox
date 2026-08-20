import "server-only"

import { auth } from "@/lib/auth/container"
import { CookiePendingAuthorizationStore } from "./adapters/cookie-pending-authorization-store"
import { EnvClientRegistry } from "./adapters/env-client-registry"
import { JoseTokenIssuer } from "./adapters/jose-token-issuer"
import { MemoryAuthorizationCodeStore } from "./adapters/memory-authorization-code-store"
import { createDenyAuthorization } from "./use-cases/deny-authorization"
import { createExchangeAuthorizationCode } from "./use-cases/exchange-authorization-code"
import { createFinishAuthorization } from "./use-cases/finish-authorization"
import { createStartAuthorization } from "./use-cases/start-authorization"

const clients = new EnvClientRegistry()
const pending = new CookiePendingAuthorizationStore()
const codes = new MemoryAuthorizationCodeStore()
const tokens = new JoseTokenIssuer()

export const sso = {
  clients,
  tokens,
  startAuthorization: createStartAuthorization({
    clients,
    pending,
    sessions: auth.sessions,
    codes,
  }),
  finishAuthorization: createFinishAuthorization({
    pending,
    sessions: auth.sessions,
    codes,
  }),
  exchangeAuthorizationCode: createExchangeAuthorizationCode({
    clients,
    codes,
    tokens,
  }),
  denyAuthorization: createDenyAuthorization({ pending }),
}
