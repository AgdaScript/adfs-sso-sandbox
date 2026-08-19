import "server-only"

import type { Profile, SAML } from "@node-saml/node-saml"

import type { SloSubject, SsoCallbackInput, User } from "../domain"
import { SsoAuthenticationError } from "../errors"
import type { SsoIdentityProvider } from "../ports"
import { LOGIN_PATH } from "../config"
import type { AdfsProfileMapper } from "./adfs-profile-mapper"
import { withRequestedAttributes } from "./sp-metadata"

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

  async createLogoutRedirect(subject: SloSubject): Promise<string> {
    const profile: Profile = {
      issuer: subject.nameID,
      nameID: subject.nameID,
      nameIDFormat: subject.nameIDFormat,
      sessionIndex: subject.sessionIndex,
    }

    return this.saml.getLogoutUrlAsync(profile, LOGIN_PATH, {})
  }

  async completeLogout(input: {
    samlRequest?: string
    samlResponse?: string
    originalQuery?: string
  }): Promise<string> {
    try {
      if (input.samlRequest) {
        const { profile } = await this.saml.validatePostRequestAsync({
          SAMLRequest: input.samlRequest,
        })

        if (profile) {
          return this.saml.getLogoutResponseUrlAsync(profile, LOGIN_PATH, {}, true)
        }
      }

      if (input.samlResponse && input.originalQuery) {
        await this.saml.validateRedirectAsync(
          { SAMLResponse: input.samlResponse },
          input.originalQuery,
        )
      } else if (input.samlResponse) {
        await this.saml.validatePostResponseAsync({
          SAMLResponse: input.samlResponse,
        })
      }
    } catch (error) {
      console.error(
        "Falha a concluir o SLO do ADFS; a sessão local já foi encerrada.",
        error instanceof Error ? error.message : "erro desconhecido",
      )
    }

    return LOGIN_PATH
  }

  getServiceProviderMetadata(): string {
    return withRequestedAttributes(this.saml.generateServiceProviderMetadata(null))
  }
}
