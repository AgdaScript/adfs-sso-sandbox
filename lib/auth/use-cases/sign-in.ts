import "server-only"

import type { Credentials, User } from "../domain"
import type { Authenticator, SessionService } from "../ports"

export type SignInResult =
  | { ok: true; user: User }
  | { ok: false; error: "invalid_input" | "invalid_credentials" }

export function createSignIn(deps: {
  authenticator: Authenticator
  sessions: SessionService
}) {
  return async function signIn(credentials: Credentials): Promise<SignInResult> {
    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    if (!email || !password) {
      return { ok: false, error: "invalid_input" }
    }

    const user = await deps.authenticator.authenticate({ email, password })

    if (!user) {
      return { ok: false, error: "invalid_credentials" }
    }

    await deps.sessions.create(user.id)
    return { ok: true, user }
  }
}
