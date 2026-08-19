export type UserId = string

export type Credentials = {
  email: string
  password: string
}

export type User = {
  id: UserId
  name: string
  email: string
}

export type SessionPayload = {
  userId: UserId
}

export type PublicUser = {
  id: UserId
  name: string
  email: string
}
