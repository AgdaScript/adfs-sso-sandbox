import { createHmac } from "node:crypto"

import { getAppBaseUrl, getSessionSecret } from "@/lib/auth/config"

export const OAUTH_AUTHORIZE_PATH = "/oauth/authorize"
export const OAUTH_CONTINUE_PATH = "/oauth/continue"
export const OAUTH_TOKEN_PATH = "/oauth/token"
export const OAUTH_USERINFO_PATH = "/oauth/userinfo"
export const OAUTH_LOGOUT_PATH = "/oauth/logout"
export const OAUTH_LOGOUT_NEXT_PATH = "/oauth/logout/next"
export const OAUTH_SESSION_PATH = "/oauth/session"
export const LOGOUT_CHAIN_COOKIE = "sso_logout"
export const DEMO_APP_PATH = "/app-exemplo"
export const DEMO_APP_CALLBACK_PATH = "/app-exemplo/callback"
export const PENDING_OAUTH_COOKIE = "sso_oauth"
export const AUTHORIZATION_CODE_TTL_MS = 5 * 60 * 1000
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60
export const DEFAULT_CLIENT_ID = "app-exemplo"
export const RANDOM_APP_CLIENT_ID = "random-app"
export const RANDOM_APP_CALLBACK_PATH = "/auth/callback"

export function getSsoIssuer(): string {
  return getAppBaseUrl()
}

export function getDefaultClientRedirectUri(): string {
  return `${getAppBaseUrl()}${DEMO_APP_CALLBACK_PATH}`
}

export function getDefaultClientSecret(): string {
  return (
    process.env.SSO_CLIENT_SECRET ??
    createHmac("sha256", getSessionSecret()).update("sso-client:app-exemplo").digest("base64url")
  )
}

export function getRandomAppRedirectUri(): string {
  return process.env.SSO_RANDOM_APP_REDIRECT_URI ?? `http://localhost:3001${RANDOM_APP_CALLBACK_PATH}`
}

export function getRandomAppClientSecret(): string {
  return (
    process.env.SSO_RANDOM_APP_CLIENT_SECRET ??
    createHmac("sha256", getSessionSecret()).update("sso-client:random-app").digest("base64url")
  )
}

export function getRandomAppLogoutUri(): string {
  if (process.env.SSO_RANDOM_APP_LOGOUT_URI) {
    return process.env.SSO_RANDOM_APP_LOGOUT_URI
  }

  try {
    const callback = new URL(getRandomAppRedirectUri())
    if (callback.pathname.endsWith(RANDOM_APP_CALLBACK_PATH)) {
      callback.pathname = callback.pathname.slice(0, -RANDOM_APP_CALLBACK_PATH.length) + "/auth/logout"
      callback.search = ""
      callback.hash = ""
      return callback.toString()
    }
  } catch {
    // fallback abaixo
  }

  return "http://localhost:3001/auth/logout"
}

export function deriveLogoutUris(redirectUris: string[]): string[] {
  const derived: string[] = []

  for (const uri of redirectUris) {
    try {
      const url = new URL(uri)
      if (!url.pathname.endsWith("/auth/callback")) {
        continue
      }
      url.pathname = `${url.pathname.slice(0, -"/auth/callback".length)}/auth/logout`
      url.search = ""
      url.hash = ""
      derived.push(url.toString())
    } catch {
      // ignora URI inválido
    }
  }

  return derived
}
