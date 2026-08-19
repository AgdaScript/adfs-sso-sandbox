import type { PublicUser, User } from "./domain"

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
