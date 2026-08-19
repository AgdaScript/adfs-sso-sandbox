import { LOGIN_PATH, PRIVATE_HOME_PATH, PRIVATE_PATH_PREFIXES } from "./config"

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function isLoginPath(pathname: string): boolean {
  return pathname === LOGIN_PATH
}

export function safeInternalPath(value: string | undefined | null): string {
  if (!value) {
    return PRIVATE_HOME_PATH
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return PRIVATE_HOME_PATH
  }

  return value
}
