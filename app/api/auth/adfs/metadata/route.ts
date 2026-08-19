import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/container"

export const runtime = "nodejs"

export async function GET() {
  const metadata = auth.getServiceProviderMetadata()

  return new NextResponse(metadata, {
    status: 200,
    headers: {
      "Content-Type": "application/samlmetadata+xml; charset=utf-8",
      "Content-Disposition": 'inline; filename="sp-metadata.xml"',
    },
  })
}
