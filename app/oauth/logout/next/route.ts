import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET() {
  try {
    const next = await sso.continueGlobalLogout()
    return NextResponse.redirect(new URL(next.redirectTo, getAppBaseUrl()), 303)
  } catch (error) {
    console.error(
      "Falha a continuar o logout global:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    return NextResponse.redirect(new URL(LOGIN_PATH, getAppBaseUrl()), 303)
  }
}
