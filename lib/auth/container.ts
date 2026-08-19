import "server-only"

import { CookieSessionStore } from "./adapters/cookie-session-store"
import { CredentialsAuthenticator } from "./adapters/credentials-authenticator"
import { InMemoryUserStore } from "./adapters/in-memory-user-store"
import { JoseSessionCipher } from "./adapters/jose-session-cipher"
import { CookieSessionService } from "./services/cookie-session-service"
import { createSignIn } from "./use-cases/sign-in"
import { createSignOut } from "./use-cases/sign-out"

const userStore = new InMemoryUserStore()
const authenticator = new CredentialsAuthenticator(userStore)
const sessionCipher = new JoseSessionCipher()
const sessionCookies = new CookieSessionStore()
const sessions = new CookieSessionService(sessionCipher, sessionCookies)

export const auth = {
  users: userStore,
  sessions,
  cipher: sessionCipher,
  signIn: createSignIn({ authenticator, sessions }),
  signOut: createSignOut({ sessions }),
}
