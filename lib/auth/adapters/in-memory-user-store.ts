import "server-only"

import type { User, UserId } from "../domain"
import type { CredentialLookup, UserCredentials, UserReader } from "../ports"

type StoredUser = User & {
  passwordHash: string
}

const DEMO_USERS: readonly StoredUser[] = [
  {
    id: "user-demo",
    name: "Utilizador Demo",
    email: "demo@local",
    // SHA-256 de "demo123" — sandbox apenas, substituir por IdP (ADFS) depois
    passwordHash:
      "d3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791",
  },
]

function toUser(record: StoredUser): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
  }
}

export class InMemoryUserStore implements UserReader, CredentialLookup {
  findById(id: UserId): Promise<User | null> {
    const record = DEMO_USERS.find((user) => user.id === id)
    return Promise.resolve(record ? toUser(record) : null)
  }

  findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const normalized = email.trim().toLowerCase()
    const record = DEMO_USERS.find((user) => user.email === normalized)

    if (!record) {
      return Promise.resolve(null)
    }

    return Promise.resolve({
      user: toUser(record),
      passwordHash: record.passwordHash,
    })
  }
}
