import { createHmac } from "node:crypto"

import { getAppBaseUrl, getSessionSecret } from "@/lib/auth/config"

export const OAUTH_AUTHORIZE_PATH = "/oauth/authorize"
export const OAUTH_CONTINUE_PATH = "/oauth/continue"
export const OAUTH_TOKEN_PATH = "/oauth/token"
export const OAUTH_USERINFO_PATH = "/oauth/userinfo"
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
