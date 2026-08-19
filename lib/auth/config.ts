export const SESSION_COOKIE_NAME = "session"
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
export const LOGIN_PATH = "/login"
export const PRIVATE_HOME_PATH = "/privado"
export const PRIVATE_PATH_PREFIXES = ["/privado"] as const

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error("SESSION_SECRET não está definida. Copie .env.example para .env.local.")
  }

  return secret
}

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  }
}
