import "server-only"

import type { SsoIdentityProvider } from "../ports"
import { safeInternalPath } from "../route-policy"

export function createStartSsoLogin(deps: { identityProvider: SsoIdentityProvider }) {
  return async function startSsoLogin(relayState?: string | null): Promise<string> {
    return deps.identityProvider.createLoginRedirect(safeInternalPath(relayState))
  }
}
