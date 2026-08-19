import "server-only"

import type { SAML } from "@node-saml/node-saml"

import type { SsoCallbackInput, User } from "../domain"
import { SsoAuthenticationError } from "../errors"
import type { SsoIdentityProvider } from "../ports"
import type { AdfsProfileMapper } from "./adfs-profile-mapper"

export class AdfsSamlIdentityProvider implements SsoIdentityProvider {
  constructor(
    private readonly saml: SAML,
    private readonly mapper: AdfsProfileMapper,
  ) {}

  async createLoginRedirect(relayState: string): Promise<string> {
    return this.saml.getAuthorizeUrlAsync(relayState, undefined, {})
  }

  async authenticateResponse(input: SsoCallbackInput): Promise<User> {
    if (!input.samlResponse) {
      throw new SsoAuthenticationError("SAMLResponse em falta no callback do ADFS.")
    }

    try {
      const { profile, loggedOut } = await this.saml.validatePostResponseAsync({
        SAMLResponse: input.samlResponse,
      })

      if (loggedOut || !profile) {
        throw new SsoAuthenticationError("A resposta SAML não autentica um utilizador.")
      }

      return this.mapper.toUser(profile)
    } catch (error) {
      if (error instanceof SsoAuthenticationError) {
        throw error
      }

      throw new SsoAuthenticationError("Falha a validar a resposta SAML do ADFS.", {
        cause: error,
      })
    }
  }

  getServiceProviderMetadata(): string {
    return this.saml.generateServiceProviderMetadata(null)
  }
}
