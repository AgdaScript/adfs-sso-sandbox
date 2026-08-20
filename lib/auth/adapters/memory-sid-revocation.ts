import "server-only"

import type { SidRevocationStore } from "../ports"

declare global {
  var __ssoRevokedSids: Set<string> | undefined
}

function revoked(): Set<string> {
  globalThis.__ssoRevokedSids ??= new Set()
  return globalThis.__ssoRevokedSids
}

export class MemorySidRevocationStore implements SidRevocationStore {
  revoke(sid: string): void {
    revoked().add(sid)
  }

  isRevoked(sid: string): boolean {
    return revoked().has(sid)
  }
}

export const sidRevocation = new MemorySidRevocationStore()
