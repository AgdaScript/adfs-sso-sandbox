import { NextRequest, NextResponse } from "next/server"

import { LOGIN_PATH, PRIVATE_HOME_PATH } from "@/lib/auth/config"
import {
  readOptimisticSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/optimistic-session"
import { isLoginPath, isPrivatePath, safeInternalPath } from "@/lib/auth/route-policy"

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await readOptimisticSession(token)
  const { pathname } = request.nextUrl

  if (isPrivatePath(pathname) && !session) {
    const loginUrl = new URL(LOGIN_PATH, request.nextUrl)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPath(pathname) && session) {
    const from = request.nextUrl.searchParams.get("from")
    const destination = from ? safeInternalPath(from) : PRIVATE_HOME_PATH
    return NextResponse.redirect(new URL(destination, request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
