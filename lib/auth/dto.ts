import type { PublicUser, User } from "./domain"

export function toPublicUser(user: Pick<User, "id" | "name" | "email">): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
