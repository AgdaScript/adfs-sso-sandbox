import type { PendingAuthorizationStore } from "../ports"

export function createDenyAuthorization(deps: { pending: PendingAuthorizationStore }) {
  return async function denyAuthorization(
    error = "access_denied",
  ): Promise<{ redirectTo: string }> {
    const pending = await deps.pending.read()
    await deps.pending.clear()

    if (!pending) {
      return { redirectTo: "/" }
    }

    const target = new URL(pending.redirectUri)
    target.searchParams.set("error", error)
    if (pending.state) {
      target.searchParams.set("state", pending.state)
    }
    return { redirectTo: target.toString() }
  }
}
