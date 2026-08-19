import "server-only"

import { CookieSessionStore } from "./adapters/cookie-session-store"
import { loadAdfsConfig } from "./adapters/adfs-config"
import { AdfsProfileMapper } from "./adapters/adfs-profile-mapper"
import { createAdfsSamlClient } from "./adapters/adfs-saml-client"
import { AdfsSamlIdentityProvider } from "./adapters/adfs-saml-provider"
import { JoseSessionCipher } from "./adapters/jose-session-cipher"
import { CookieSessionService } from "./services/cookie-session-service"
import { createCompleteSsoLogin } from "./use-cases/complete-sso-login"
import { createSignOut } from "./use-cases/sign-out"
import { createStartSsoLogin } from "./use-cases/start-sso-login"

const sessionCipher = new JoseSessionCipher()
const sessionCookies = new CookieSessionStore()
const sessions = new CookieSessionService(sessionCipher, sessionCookies)
const profileMapper = new AdfsProfileMapper()

function createIdentityProvider() {
  return loadAdfsConfig().then(
    (config) =>
      new AdfsSamlIdentityProvider(createAdfsSamlClient(config), profileMapper),
  )
}

export const auth = {
  sessions,
  cipher: sessionCipher,
  startSsoLogin: async (relayState?: string | null) => {
    const identityProvider = await createIdentityProvider()
    return createStartSsoLogin({ identityProvider })(relayState)
  },
  completeSsoLogin: async (input: { samlResponse: string; relayState?: string | null }) => {
    const identityProvider = await createIdentityProvider()
    return createCompleteSsoLogin({
      identityProvider,
      sessions,
    })(input)
  },
  getServiceProviderMetadata: async () => {
    const identityProvider = await createIdentityProvider()
    return identityProvider.getServiceProviderMetadata()
  },
  signOut: createSignOut({ sessions }),
}
