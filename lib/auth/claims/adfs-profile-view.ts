import type { SamlClaims } from "../domain"
import type { AdfsClaimField } from "./adfs-claim-catalog"

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\/+$/, "")
}

function keyTail(key: string): string {
  const parts = key.split("/")
  return (parts[parts.length - 1] ?? key).toLowerCase()
}

export function findClaim(
  claims: SamlClaims,
  keys: readonly string[],
): string | string[] | undefined {
  const wanted = new Set(keys.map(normalizeKey))
  const wantedTails = new Set(keys.map(keyTail))

  for (const [actualKey, value] of Object.entries(claims)) {
    const normalized = normalizeKey(actualKey)
    if (wanted.has(normalized) || wantedTails.has(keyTail(actualKey))) {
      return value
    }
  }

  return undefined
}

export function formatClaimValue(value: string | string[] | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return Array.isArray(value) ? value.join(", ") : value
}

export type ProfileFieldView = {
  id: string
  label: string
  value: string | undefined
}

export function toFieldViews(
  claims: SamlClaims,
  fields: readonly AdfsClaimField[],
): ProfileFieldView[] {
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    value: formatClaimValue(findClaim(claims, field.keys)),
  }))
}

export function unusedClaims(
  claims: SamlClaims,
  knownFields: readonly AdfsClaimField[],
): Array<{ key: string; value: string }> {
  const known = new Set(knownFields.flatMap((field) => field.keys.map(normalizeKey)))
  const knownTails = new Set(knownFields.flatMap((field) => field.keys.map(keyTail)))

  return Object.entries(claims)
    .filter(([key]) => !known.has(normalizeKey(key)) && !knownTails.has(keyTail(key)))
    .map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(", ") : value,
    }))
}
