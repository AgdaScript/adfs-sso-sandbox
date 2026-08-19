import Link from "next/link"

import { PageFrame } from "@/app/components/page-frame"
import { SignOutButton } from "@/app/components/sign-out-button"
import { getCurrentUser } from "@/lib/auth/dal"

export default async function PublicPage() {
  const user = await getCurrentUser()

  return (
    <PageFrame
      badge="Pública"
      title="Página pública"
      description="Qualquer pessoa pode ver este conteúdo. Para a área privada, entre com as credenciais do ADFS."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {user ? (
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Está autenticado como <strong>{user.name}</strong> ({user.email}).
          </p>
        ) : (
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Não há sessão ativa. Pode explorar esta página sem entrar.
          </p>
        )}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/privado"
          prefetch={false}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Ir para a página privada
        </Link>
        {user ? (
          <SignOutButton />
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
          >
            Entrar
          </Link>
        )}
      </div>
    </PageFrame>
  )
}
