import { Suspense } from "react"
import Link from "next/link"

import { SignOutButton } from "@/app/components/sign-out-button"
import { getCurrentUser } from "@/lib/auth/dal"

export async function SessionNav() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Link href="/login" className="hover:text-zinc-950 dark:hover:text-zinc-50">
        Entrar
      </Link>
    )
  }

  return <SignOutButton />
}

export function SessionNavFallback() {
  return (
    <span className="text-zinc-400" aria-hidden>
      …
    </span>
  )
}

export function SessionNavSlot() {
  return (
    <Suspense fallback={<SessionNavFallback />}>
      <SessionNav />
    </Suspense>
  )
}
