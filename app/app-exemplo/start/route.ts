import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"

import { getAppBaseUrl } from "@/lib/auth/config"
import {
  DEFAULT_CLIENT_ID,
  DEMO_APP_CALLBACK_PATH,
  OAUTH_AUTHORIZE_PATH,
} from "@/lib/sso/config"

export const runtime = "nodejs"

export async function GET() {
  const state = randomBytes(16).toString("base64url")
  const redirectUri = `${getAppBaseUrl()}${DEMO_APP_CALLBACK_PATH}`
  const authorize = new URL(OAUTH_AUTHORIZE_PATH, getAppBaseUrl())
  authorize.searchParams.set("response_type", "code")
  authorize.searchParams.set("client_id", process.env.SSO_CLIENT_ID ?? DEFAULT_CLIENT_ID)
  authorize.searchParams.set("redirect_uri", redirectUri)
  authorize.searchParams.set("state", state)

  const response = NextResponse.redirect(authorize, 303)
  response.cookies.set("demo_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: redirectUri.startsWith("https://"),
  })
  return response
}
