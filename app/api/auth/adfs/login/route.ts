import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export const runtime = "nodejs"

async function startLogin(from: string | null) {
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

export async function GET(request: Request) {
  return startLogin(new URL(request.url).searchParams.get("from"))
}

export async function POST(request: Request) {
  const formData = await request.formData()
  return startLogin(String(formData.get("from") ?? "") || null)
}
