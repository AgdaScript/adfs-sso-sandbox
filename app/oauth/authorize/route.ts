import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { BrokerAuthorizationError } from "@/lib/sso/errors"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const clientId = params.get("client_id") ?? ""
  const redirectUri = params.get("redirect_uri") ?? ""
  const state = params.get("state") ?? ""
  const responseType = params.get("response_type") ?? ""

  try {
    const started = await sso.startAuthorization({
      clientId,
      redirectUri,
      state,
      responseType,
    })
    return NextResponse.redirect(new URL(started.redirectTo, getAppBaseUrl()), 303)
  } catch (error) {
    console.error(
      "Falha no /oauth/authorize:",
      error instanceof Error ? error.message : "erro desconhecido",
    )

    if (error instanceof BrokerAuthorizationError && error.code !== "invalid_redirect_uri") {
      try {
        const target = new URL(redirectUri)
        target.searchParams.set("error", error.code)
        if (state) {
          target.searchParams.set("state", state)
        }
        return NextResponse.redirect(target, 303)
      } catch {
        // redirect_uri inválido: cai no login
      }
    }

    const loginUrl = new URL(LOGIN_PATH, getAppBaseUrl())
    loginUrl.searchParams.set("error", "sso")
    return NextResponse.redirect(loginUrl, 303)
  }
}
