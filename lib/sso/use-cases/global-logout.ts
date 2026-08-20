import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import type { SessionService, SloSubject } from "@/lib/auth/ports"
import { OAUTH_LOGOUT_NEXT_PATH } from "../config"
import type { LogoutChain } from "../domain"
import type { ClientRegistry, LogoutChainStore, PendingAuthorizationStore } from "../ports"

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function isAllowedFinal(candidate: string, clients: ReturnType<ClientRegistry["list"]>): boolean {
  if (candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.includes("\\")) {
    return true
  }

  try {
    const url = new URL(candidate)
    const ssoOrigin = new URL(getAppBaseUrl()).origin
    if (url.origin === ssoOrigin) {
      return true
    }

    return clients.some((client) =>
      [...client.redirectUris, ...client.logoutUris].some((uri) => {
        try {
          return new URL(uri).origin === url.origin
        } catch {
          return false
        }
      }),
    )
  } catch {
    return false
  }
}

export function createStartGlobalLogout(deps: {
  clients: ClientRegistry
  sessions: SessionService
  pending: PendingAuthorizationStore
  chain: LogoutChainStore
}) {
  return async function startGlobalLogout(input: {
    postLogoutRedirectUri?: string
  }): Promise<void> {
    const session = await deps.sessions.read()
    await deps.sessions.destroy()
    await deps.pending.clear()

    const clients = deps.clients.list()
    const requested = input.postLogoutRedirectUri?.trim() || "/"
    const final = isAllowedFinal(requested, clients) ? requested : "/"

    await deps.chain.write({
      remaining: unique(clients.flatMap((client) => client.logoutUris)),
      final,
      nameID: session?.nameID,
      nameIDFormat: session?.nameIDFormat,
      sessionIndex: session?.sessionIndex,
    })
  }
}

export function createContinueGlobalLogout(deps: {
  chain: LogoutChainStore
  createAdfsLogoutRedirect: (subject: SloSubject, relayState: string) => Promise<string>
}) {
  return async function continueGlobalLogout(): Promise<{ redirectTo: string }> {
    const chain = await deps.chain.read()
    if (!chain) {
      return { redirectTo: LOGIN_PATH }
    }

    const nextLogout = chain.remaining[0]
    if (nextLogout) {
      const rest: LogoutChain = { ...chain, remaining: chain.remaining.slice(1) }
      await deps.chain.write(rest)
      const target = new URL(nextLogout)
      target.searchParams.set("continue", `${getAppBaseUrl()}${OAUTH_LOGOUT_NEXT_PATH}`)
      return { redirectTo: target.toString() }
    }

    if (chain.nameID && chain.nameIDFormat) {
      try {
        return {
          redirectTo: await deps.createAdfsLogoutRedirect(
            {
              nameID: chain.nameID,
              nameIDFormat: chain.nameIDFormat,
              sessionIndex: chain.sessionIndex,
            },
            chain.final,
          ),
        }
      } catch (error) {
        console.error(
          "Não foi possível iniciar o Single Logout no ADFS; as sessões das apps já foram encerradas.",
          error instanceof Error ? error.message : "erro desconhecido",
        )
      }
    }

    await deps.chain.clear()
    return { redirectTo: chain.final }
  }
}
