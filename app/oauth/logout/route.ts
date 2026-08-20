import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams

  try {
    await sso.startGlobalLogout({
      postLogoutRedirectUri: params.get("post_logout_redirect_uri") ?? undefined,
    })
    const next = await sso.continueGlobalLogout()
    return NextResponse.redirect(new URL(next.redirectTo, getAppBaseUrl()), 303)
  } catch (error) {
    console.error(
      "Falha no logout global:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    return NextResponse.redirect(new URL(LOGIN_PATH, getAppBaseUrl()), 303)
  }
}

export async function POST(request: Request) {
  return GET(request)
}
