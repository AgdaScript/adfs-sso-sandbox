import "server-only"

import type { Credentials, User } from "../domain"
import type { Authenticator, CredentialLookup } from "../ports"
import { hashPassword, passwordHashesMatch } from "./password-hasher"

export class CredentialsAuthenticator implements Authenticator {
  constructor(private readonly credentials: CredentialLookup) {}

  async authenticate(input: Credentials): Promise<User | null> {
    const record = await this.credentials.findCredentialsByEmail(input.email)

    if (!record) {
      return null
    }

    const incomingHash = await hashPassword(input.password)

    if (!passwordHashesMatch(record.passwordHash, incomingHash)) {
      return null
    }

    return record.user
  }
}
