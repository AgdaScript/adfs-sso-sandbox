export const SESSION_COOKIE_NAME = "session"
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
export const LOGIN_PATH = "/login"
export const PRIVATE_HOME_PATH = "/privado"
export const PRIVATE_PATH_PREFIXES = ["/privado"] as const
export const ADFS_LOGIN_PATH = "/api/auth/adfs/login"
export const ADFS_CALLBACK_PATH = "/api/auth/callback/adfs"
export const ADFS_METADATA_PATH = "/api/auth/adfs/metadata"

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error("SESSION_SECRET ou NEXTAUTH_SECRET não está definida no .env.local.")
  }

  return secret
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.APP_URL

  if (!url) {
    throw new Error("NEXTAUTH_URL não está definida no .env.local.")
  }

  return url.replace(/\/$/, "")
}

export function usesSecureCookies(): boolean {
  const url = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? ""
  return url.startsWith("https://") || process.env.NODE_ENV === "production"
}

export function isAdfsConfigured(): boolean {
  return Boolean(
    (process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET) &&
      (process.env.NEXTAUTH_URL ?? process.env.APP_URL) &&
      process.env.ADFS_ENTRY_POINT &&
      process.env.ADFS_ISSUER &&
      (process.env.ADFS_CERT || process.env.ADFS_METADATA_URL),
  )
}

export function getSessionCookieOptions(expiresAt: Date) {
  const secure = usesSecureCookies()

  return {
    httpOnly: true,
    secure,
    // ACS do ADFS chega via POST cross-site; None+Secure permite gravar a sessão nesse callback.
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    path: "/",
    expires: expiresAt,
  }
}
