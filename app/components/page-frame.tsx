import type { ReactNode } from "react"
import Link from "next/link"

type PageFrameProps = {
  title: string
  description: string
  badge: string
  children: ReactNode
}

export function PageFrame({ title, description, badge, children }: PageFrameProps) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ADFS SSO Sandbox
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              Pública
            </Link>
            <Link href="/privado" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              Privada
            </Link>
            <Link href="/login" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              Entrar
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <p className="w-fit rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
          {badge}
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
        {children}
      </main>
    </div>
  )
}
