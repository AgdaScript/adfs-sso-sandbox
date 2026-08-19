import { PageFrame } from "@/app/components/page-frame"
import { SignOutButton } from "@/app/components/sign-out-button"
import { requireUser } from "@/lib/auth/dal"

export default async function PrivatePage() {
  const user = await requireUser()

  return (
    <PageFrame
      badge="Privada"
      title="Página privada"
      description="Esta rota só é renderizada com uma sessão válida. O proxy faz um redirect otimista; a Data Access Layer confirma o utilizador antes de devolver dados."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Nome</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">ID</dt>
            <dd className="font-mono text-xs">{user.id}</dd>
          </div>
        </dl>
      </section>
      <SignOutButton />
    </PageFrame>
  )
}
