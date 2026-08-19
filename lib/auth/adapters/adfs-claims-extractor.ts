import "server-only"

import type { Profile } from "@node-saml/node-saml"

import type { SamlClaims } from "../domain"

const SKIP_KEYS = new Set([
  "getAssertionXml",
  "getAssertion",
  "getSamlResponseXml",
])

function toClaimValue(value: unknown): string | string[] | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => toClaimValue(item))
      .flatMap((item) => (item == null ? [] : Array.isArray(item) ? item : [item]))
    return items.length > 0 ? items : null
  }

  if (value && typeof value === "object" && "_" in value) {
    return toClaimValue((value as { _: unknown })._)
  }

  return null
}

export function extractSamlClaims(profile: Profile): SamlClaims {
  const claims: SamlClaims = {}

  for (const [key, raw] of Object.entries(profile)) {
    if (SKIP_KEYS.has(key) || typeof raw === "function") {
      continue
    }

    const value = toClaimValue(raw)
    if (value) {
      claims[key] = value
    }
  }

  return claims
}
