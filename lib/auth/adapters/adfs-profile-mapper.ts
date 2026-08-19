import "server-only"

import type { Profile } from "@node-saml/node-saml"

import type { User } from "../domain"
import { SsoAuthenticationError } from "../errors"
import { extractSamlClaims } from "./adfs-claims-extractor"

const EMAIL_CLAIM_KEYS = [
  "email",
  "mail",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
] as const

const NAME_CLAIM_KEYS = [
  "name",
  "displayName",
  "Display-Name",
  "displayname",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  "http://schemas.microsoft.com/identity/claims/displayname",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
] as const

const ID_CLAIM_KEYS = [
  ...EMAIL_CLAIM_KEYS,
  "windowsaccountname",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname",
  "Display-Name",
  "displayName",
  "displayname",
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

function fallbackName(profile: Profile): string | null {
  const given = firstString(profile, [
    "givenname",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  ])
  const surname = firstString(profile, [
    "surname",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
  ])
  const combined = [given, surname].filter(Boolean).join(" ").trim()
  return combined || null
}

function sessionIdFrom(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()

  return slug || "adfs-user"
}

export class AdfsProfileMapper {
  toUser(profile: Profile): User {
    const email =
      firstString(profile, EMAIL_CLAIM_KEYS) ??
      (looksLikeEmail(profile.nameID) ? profile.nameID : null)

    const name =
      firstString(profile, NAME_CLAIM_KEYS) ??
      fallbackName(profile) ??
      email ??
      profile.nameID
    const rawId =
      profile.nameID || firstString(profile, ID_CLAIM_KEYS) || fallbackName(profile)

    if (!rawId || !name) {
      throw new SsoAuthenticationError("A asserção SAML não contém um identificador do utilizador.")
    }

    const id = looksLikeEmail(rawId) || rawId.includes("\\") ? rawId : sessionIdFrom(rawId)

    return {
      id,
      name,
      email: email ?? `${id}@adfs.local`,
      nameID: profile.nameID || id,
      nameIDFormat:
        profile.nameIDFormat ||
        "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
      sessionIndex: profile.sessionIndex,
      claims: extractSamlClaims(profile),
    }
  }
}

function looksLikeEmail(value: string | undefined): boolean {
  return Boolean(value && value.includes("@"))
}
