import { NextResponse } from "next/server"

import { getAppBaseUrl } from "@/lib/auth/config"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET() {
  const denied = await sso.denyAuthorization("access_denied")
  return NextResponse.redirect(new URL(denied.redirectTo, getAppBaseUrl()), 303)
}

export async function POST() {
  return GET()
}
