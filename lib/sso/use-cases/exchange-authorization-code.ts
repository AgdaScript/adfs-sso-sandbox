import { BrokerAuthorizationError } from "../errors"
import type { AuthorizationCodeStore, ClientRegistry, TokenIssuer } from "../ports"
import type { IssuedBrokerTokens } from "../domain"

export function createExchangeAuthorizationCode(deps: {
  clients: ClientRegistry
  codes: AuthorizationCodeStore
  tokens: TokenIssuer
}) {
  return async function exchangeAuthorizationCode(input: {
    grantType: string
    code: string
    redirectUri: string
    clientId: string
    clientSecret: string
  }): Promise<IssuedBrokerTokens> {
    if (input.grantType !== "authorization_code") {
      throw new BrokerAuthorizationError(
        "unsupported_grant_type",
        "Apenas grant_type=authorization_code é suportado.",
      )
    }

    const client = deps.clients.authenticate(input.clientId, input.clientSecret)
    if (!client) {
      throw new BrokerAuthorizationError("invalid_client", "Credenciais do cliente inválidas.")
    }

    const stored = await deps.codes.consume(input.code)
    if (!stored || stored.clientId !== client.id || stored.redirectUri !== input.redirectUri) {
      throw new BrokerAuthorizationError("invalid_grant", "Código de autorização inválido ou expirado.")
    }

    return deps.tokens.issue({
      user: stored.user,
      clientId: client.id,
    })
  }
}
