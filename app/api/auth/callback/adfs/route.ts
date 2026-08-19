import { NextResponse } from "next/server"

import {
  getAppBaseUrl,
  getSessionCookieOptions,
  LOGIN_PATH,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export const runtime = "nodejs"

function logRawAdfsResponse(samlResponse: string, relayState: string) {
  let xml = ""

  try {
    xml = Buffer.from(samlResponse, "base64").toString("utf8")
  } catch {
    xml = "(não foi possível descodificar o Base64)"
  }

  console.log("[ADFS] resposta crua (antes da sessão)")
  console.log("[ADFS] RelayState:", relayState)
  console.log("[ADFS] SAMLResponse Base64:", samlResponse)
  console.log("[ADFS] SAMLResponse XML:\n", xml)
}

function loginErrorRedirect() {
  const loginUrl = new URL(LOGIN_PATH, getAppBaseUrl())
  loginUrl.searchParams.set("error", "sso")
  return NextResponse.redirect(loginUrl, 303)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const samlResponse = String(formData.get("SAMLResponse") ?? "")
    const relayState = String(formData.get("RelayState") ?? "")
    logRawAdfsResponse(samlResponse, relayState)

    const completed = await auth.completeSsoLogin({
      samlResponse,
      relayState,
    })

    const response = NextResponse.redirect(
      new URL(completed.redirectTo, getAppBaseUrl()),
      303,
    )
    response.cookies.set(
      SESSION_COOKIE_NAME,
      completed.token,
      getSessionCookieOptions(completed.expiresAt),
    )
    return response
  } catch (error) {
    console.error(
      "Falha no callback SAML ADFS:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    return loginErrorRedirect()
  }
}
