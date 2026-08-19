import { NextResponse } from "next/server"

import { getAppBaseUrl, LOGIN_PATH } from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export const runtime = "nodejs"

function toAbsoluteUrl(target: string) {
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return new URL(target)
  }

  return new URL(target, getAppBaseUrl())
}

async function handleLogout(input: {
  samlRequest?: string
  samlResponse?: string
  originalQuery?: string
}) {
  try {
    const redirectTo = await auth.completeLogout(input)
    return NextResponse.redirect(toAbsoluteUrl(redirectTo), 303)
  } catch (error) {
    console.error(
      "Falha no callback de logout ADFS:",
      error instanceof Error ? error.message : "erro desconhecido",
    )
    return NextResponse.redirect(new URL(LOGIN_PATH, getAppBaseUrl()), 303)
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  return handleLogout({
    samlRequest: url.searchParams.get("SAMLRequest") ?? undefined,
    samlResponse: url.searchParams.get("SAMLResponse") ?? undefined,
    originalQuery: url.search.slice(1) || undefined,
  })
}

export async function POST(request: Request) {
  const formData = await request.formData()

  return handleLogout({
    samlRequest: String(formData.get("SAMLRequest") ?? "") || undefined,
    samlResponse: String(formData.get("SAMLResponse") ?? "") || undefined,
  })
}
