import "server-only"

import type { Profile } from "@node-saml/node-saml"

import type { User } from "../domain"
import { SsoAuthenticationError } from "../errors"

const EMAIL_CLAIM_KEYS = [
  "email",
  "mail",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
] as const

const NAME_CLAIM_KEYS = [
  "name",
  "displayName",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  "http://schemas.microsoft.com/identity/claims/displayname",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
] as const

function firstString(profile: Profile, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = profile[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return null
}

export class AdfsProfileMapper {
  toUser(profile: Profile): User {
    const email =
      firstString(profile, EMAIL_CLAIM_KEYS) ??
      (looksLikeEmail(profile.nameID) ? profile.nameID : null)

    const name = firstString(profile, NAME_CLAIM_KEYS) ?? email ?? profile.nameID
    const id = profile.nameID || email

    if (!id) {
      throw new SsoAuthenticationError("A asserção SAML não contém um identificador do utilizador.")
    }

    return {
      id,
      name,
      email: email ?? `${id}@adfs.local`,
      nameID: profile.nameID || id,
      nameIDFormat:
        profile.nameIDFormat ||
        "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
      sessionIndex: profile.sessionIndex,
    }
  }
}

function looksLikeEmail(value: string | undefined): boolean {
  return Boolean(value && value.includes("@"))
}
