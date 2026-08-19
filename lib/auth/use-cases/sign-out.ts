import "server-only"

import type { SessionService } from "../ports"

export function createSignOut(deps: { sessions: SessionService }) {
  return async function signOut(): Promise<void> {
    await deps.sessions.destroy()
  }
}
