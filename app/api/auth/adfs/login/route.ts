import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const from = new URL(request.url).searchParams.get("from")

  try {
    const redirectUrl = await auth.startSsoLogin(from)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error(
      "Falha a iniciar SSO ADFS:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    const loginUrl = new URL(LOGIN_PATH, getAppBaseUrl())
    loginUrl.searchParams.set("error", "sso")
    return NextResponse.redirect(loginUrl)
  }
}
