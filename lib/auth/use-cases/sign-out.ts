import "server-only"

import { LOGIN_PATH } from "../config"
import type { SessionService, SsoIdentityProvider } from "../ports"

export type SignOutResult = {
  redirectTo: string
}

export function createSignOut(deps: {
  sessions: SessionService
  identityProvider: SsoIdentityProvider
}) {
  return async function signOut(): Promise<SignOutResult> {
    const session = await deps.sessions.read()
    await deps.sessions.destroy()

    if (!session?.nameID) {
      return { redirectTo: LOGIN_PATH }
    }

    try {
      const redirectTo = await deps.identityProvider.createLogoutRedirect({
        nameID: session.nameID,
        nameIDFormat: session.nameIDFormat,
        sessionIndex: session.sessionIndex,
      })
      return { redirectTo }
    } catch (error) {
      console.error(
        "Não foi possível iniciar o Single Logout no ADFS; a sessão local já foi apagada.",
        error instanceof Error ? error.message : "erro desconhecido",
      )
      return { redirectTo: LOGIN_PATH }
    }
  }
}
