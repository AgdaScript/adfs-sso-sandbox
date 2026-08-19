import "server-only"

import type { IssuedSession, User } from "../domain"
import type { SessionService, SsoIdentityProvider } from "../ports"
import { safeInternalPath } from "../route-policy"

export type CompletedSsoLogin = IssuedSession & {
  user: User
  redirectTo: string
}

export function createCompleteSsoLogin(deps: {
  identityProvider: SsoIdentityProvider
  sessions: SessionService
}) {
  return async function completeSsoLogin(input: {
    samlResponse: string
    relayState?: string | null
  }): Promise<CompletedSsoLogin> {
    const user = await deps.identityProvider.authenticateResponse({
      samlResponse: input.samlResponse,
      relayState: input.relayState ?? undefined,
    })
    const issued = await deps.sessions.issue(user)

    return {
      user,
      ...issued,
      redirectTo: safeInternalPath(input.relayState),
    }
  }
}
