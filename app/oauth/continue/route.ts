import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET() {
  try {
    const finished = await sso.finishAuthorization()
    return NextResponse.redirect(new URL(finished.redirectTo, getAppBaseUrl()), 303)
  } catch (error) {
    console.error(
      "Falha a concluir autorização OAuth:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    const loginUrl = new URL(LOGIN_PATH, getAppBaseUrl())
    loginUrl.searchParams.set("error", "sso")
    return NextResponse.redirect(loginUrl, 303)
  }
}
