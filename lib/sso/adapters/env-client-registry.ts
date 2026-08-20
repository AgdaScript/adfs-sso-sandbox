import "server-only"

import {
  DEFAULT_CLIENT_ID,
  RANDOM_APP_CLIENT_ID,
  deriveLogoutUris,
  getDefaultClientRedirectUri,
  getDefaultClientSecret,
  getRandomAppClientSecret,
  getRandomAppLogoutUri,
  getRandomAppRedirectUri,
} from "../config"
import type { RegisteredClient } from "../domain"
import type { ClientRegistry } from "../ports"

function parseOptionalUris(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback
  }

  return value
    .split(",")
    .map((uri) => uri.trim())
    .filter(Boolean)
}

function parseRedirectUris(value: string | undefined, fallback: string): string[] {
  if (!value) {
    return [fallback]
  }

  return value
    .split(",")
    .map((uri) => uri.trim())
    .filter(Boolean)
}

export class EnvClientRegistry implements ClientRegistry {
  findById(clientId: string): RegisteredClient | null {
    return this.all().find((client) => client.id === clientId) ?? null
  }

  authenticate(clientId: string, clientSecret: string): RegisteredClient | null {
    const client = this.findById(clientId)

    if (!client || client.secret !== clientSecret) {
      return null
    }

    return client
  }

  list(): RegisteredClient[] {
    return this.all()
  }

  private all(): RegisteredClient[] {
    const byId = new Map<string, RegisteredClient>()
    const demoId = process.env.SSO_CLIENT_ID ?? DEFAULT_CLIENT_ID
    const randomAppId = process.env.SSO_RANDOM_APP_CLIENT_ID ?? RANDOM_APP_CLIENT_ID

    const demoRedirects = parseRedirectUris(
      process.env.SSO_CLIENT_REDIRECT_URI,
      getDefaultClientRedirectUri(),
    )
    const randomRedirects = parseRedirectUris(
      process.env.SSO_RANDOM_APP_REDIRECT_URI,
      getRandomAppRedirectUri(),
    )

    byId.set(demoId, {
      id: demoId,
      name: process.env.SSO_CLIENT_NAME ?? "App Exemplo",
      secret: getDefaultClientSecret(),
      redirectUris: demoRedirects,
      logoutUris: parseOptionalUris(process.env.SSO_CLIENT_LOGOUT_URI, deriveLogoutUris(demoRedirects)),
    })

    byId.set(randomAppId, {
      id: randomAppId,
      name: process.env.SSO_RANDOM_APP_NAME ?? "Random App",
      secret: getRandomAppClientSecret(),
      redirectUris: randomRedirects,
      logoutUris: parseOptionalUris(
        process.env.SSO_RANDOM_APP_LOGOUT_URI,
        [getRandomAppLogoutUri()],
      ),
    })

    for (const client of parseSsoClientsJson()) {
      byId.set(client.id, client)
    }

    return [...byId.values()]
  }
}

function parseSsoClientsJson(): RegisteredClient[] {
  const json = process.env.SSO_CLIENTS
  if (!json) {
    return []
  }

  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(toClient).filter(isClient)
  } catch {
    console.error("SSO_CLIENTS no .env.local não é JSON válido.")
    return []
  }
}

function isClient(value: RegisteredClient | null): value is RegisteredClient {
  return value !== null
}

function toClient(value: unknown): RegisteredClient | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const id = typeof record.id === "string" ? record.id : null
  const secret = typeof record.secret === "string" ? record.secret : null
  const name = typeof record.name === "string" ? record.name : id
  const redirectUris = Array.isArray(record.redirectUris)
    ? record.redirectUris.filter((uri): uri is string => typeof uri === "string" && uri.length > 0)
    : []
  const logoutUris = Array.isArray(record.logoutUris)
    ? record.logoutUris.filter((uri): uri is string => typeof uri === "string" && uri.length > 0)
    : deriveLogoutUris(redirectUris)

  if (!id || !secret || redirectUris.length === 0 || !name) {
    return null
  }

  return { id, name, secret, redirectUris, logoutUris }
}
