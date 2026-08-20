import { NextResponse } from "next/server"

import { BrokerAuthorizationError } from "@/lib/sso/errors"
import { sso } from "@/lib/sso/container"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? ""
  const params = contentType.includes("application/json")
    ? await request.json().then((body) => new URLSearchParams(asRecord(body)))
    : new URLSearchParams(await request.text())

  try {
    const tokens = await sso.exchangeAuthorizationCode({
      grantType: params.get("grant_type") ?? "",
      code: params.get("code") ?? "",
      redirectUri: params.get("redirect_uri") ?? "",
      clientId: params.get("client_id") ?? "",
      clientSecret: params.get("client_secret") ?? "",
    })

    return NextResponse.json({
      access_token: tokens.accessToken,
      id_token: tokens.idToken,
      token_type: tokens.tokenType,
      expires_in: tokens.expiresIn,
    })
  } catch (error) {
    const code = error instanceof BrokerAuthorizationError ? error.code : "invalid_request"
    const status = code === "invalid_client" ? 401 : 400
    return NextResponse.json(
      {
        error: code,
        error_description: error instanceof Error ? error.message : "Pedido inválido.",
      },
      { status },
    )
  }
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {}
  }

  const record: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      record[key] = raw
    }
  }
  return record
}
