import { LOGIN_PATH } from "@/lib/auth/config"
import type { SessionService } from "@/lib/auth/ports"
import { OAUTH_CONTINUE_PATH } from "../config"
import { BrokerAuthorizationError } from "../errors"
import type {
  AuthorizationCodeStore,
  ClientRegistry,
  PendingAuthorizationStore,
} from "../ports"

function isAllowedRedirect(registered: string[], candidate: string): boolean {
  return registered.includes(candidate)
}

export function createStartAuthorization(deps: {
  clients: ClientRegistry
  pending: PendingAuthorizationStore
  sessions: SessionService
  codes: AuthorizationCodeStore
}) {
  return async function startAuthorization(input: {
    clientId: string
    redirectUri: string
    state: string
    responseType: string
  }): Promise<{ redirectTo: string }> {
    if (input.responseType !== "code") {
      throw new BrokerAuthorizationError(
        "unsupported_response_type",
        "Apenas response_type=code é suportado.",
      )
    }

    const client = deps.clients.findById(input.clientId)
    if (!client) {
      throw new BrokerAuthorizationError("invalid_client", "client_id desconhecido.")
    }

    if (!isAllowedRedirect(client.redirectUris, input.redirectUri)) {
      throw new BrokerAuthorizationError(
        "invalid_redirect_uri",
        "redirect_uri não está registado para este cliente.",
      )
    }

    await deps.pending.write({
      clientId: client.id,
      redirectUri: input.redirectUri,
      state: input.state,
    })

    const session = await deps.sessions.read()
    if (session) {
      const code = await deps.codes.issue({
        clientId: client.id,
        redirectUri: input.redirectUri,
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          claims: session.claims ?? {},
        },
      })
      await deps.pending.clear()
      const target = new URL(input.redirectUri)
      target.searchParams.set("code", code)
      if (input.state) {
        target.searchParams.set("state", input.state)
      }
      return { redirectTo: target.toString() }
    }

    const login = new URL(LOGIN_PATH, "http://sso.local")
    login.searchParams.set("from", OAUTH_CONTINUE_PATH)
    return { redirectTo: `${login.pathname}?${login.searchParams.toString()}` }
  }
}
