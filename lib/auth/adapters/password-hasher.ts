import "server-only"

import { timingSafeEqual } from "node:crypto"

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Buffer.from(digest).toString("hex")
}

export function passwordHashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)

  if (a.length !== b.length) {
    return false
  }

  return timingSafeEqual(a, b)
}
