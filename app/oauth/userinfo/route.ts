import { NextResponse } from "next/server"

import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const header = request.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined
  const claims = await sso.tokens.verifyAccessToken(token)

  if (!claims) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 })
  }

  return NextResponse.json({
    sub: claims.sub,
    name: claims.name,
    email: claims.email,
    claims: claims.claims,
  })
}
