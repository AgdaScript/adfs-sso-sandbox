import type { PublicUser, User } from "./domain"

export function toPublicUser(
  user: Pick<User, "id" | "name" | "email" | "claims">,
): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    claims: user.claims ?? {},
  }
}
