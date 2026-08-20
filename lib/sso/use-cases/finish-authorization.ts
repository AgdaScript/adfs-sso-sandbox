import { LOGIN_PATH } from "@/lib/auth/config"
import type { SessionService } from "@/lib/auth/ports"
import { BrokerAuthorizationError } from "../errors"
import type { AuthorizationCodeStore, PendingAuthorizationStore } from "../ports"

export function createFinishAuthorization(deps: {
  pending: PendingAuthorizationStore
  sessions: SessionService
  codes: AuthorizationCodeStore
}) {
  return async function finishAuthorization(): Promise<{ redirectTo: string }> {
    const session = await deps.sessions.read()
    const pending = await deps.pending.read()

    if (!session) {
      const login = new URL(LOGIN_PATH, "http://sso.local")
      login.searchParams.set("from", "/oauth/continue")
      return { redirectTo: `${login.pathname}?${login.searchParams.toString()}` }
    }

    if (!pending) {
      throw new BrokerAuthorizationError(
        "invalid_request",
        "Não há um pedido de autorização pendente.",
      )
    }

    const code = await deps.codes.issue({
      clientId: pending.clientId,
      redirectUri: pending.redirectUri,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        claims: session.claims ?? {},
      },
    })
    await deps.pending.clear()

    const target = new URL(pending.redirectUri)
    target.searchParams.set("code", code)
    if (pending.state) {
      target.searchParams.set("state", pending.state)
    }
    return { redirectTo: target.toString() }
  }
}
