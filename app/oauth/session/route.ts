import { NextResponse } from "next/server"

import { sidRevocation } from "@/lib/auth/adapters/memory-sid-revocation"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const sid = new URL(request.url).searchParams.get("sid")

  if (!sid) {
    return NextResponse.json({ active: false }, { status: 400 })
  }

  if (sidRevocation.isRevoked(sid)) {
    return NextResponse.json({ active: false }, { status: 401 })
  }

  return NextResponse.json({ active: true })
}
