import Link from "next/link"

import { PageFrame } from "@/app/components/page-frame"
import { SignOutButton } from "@/app/components/sign-out-button"
import { getCurrentUser } from "@/lib/auth/dal"
import { OAUTH_AUTHORIZE_PATH, OAUTH_TOKEN_PATH, OAUTH_USERINFO_PATH } from "@/lib/sso/config"

export default async function PublicPage() {
  const user = await getCurrentUser()

  return (
    <PageFrame
      badge="SSO Microservice"
      title="Broker ADFS"
      description="As aplicações internas não falam com o ADFS. Pedem login a este serviço (ex.: adfs-sso-random-app), que trata do SAML e devolve um código/JWT."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {user ? (
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Sessão central ativa: <strong>{user.name}</strong> ({user.email}).
            Outras apps entram em SSO silencioso enquanto esta sessão existir.
          </p>
        ) : (
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Sem sessão neste serviço. Uma app cliente será redirecionada ao ADFS
            na primeira entrada.
          </p>
        )}
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 font-semibold">Contrato para outras apps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Redirect do utilizador para{" "}
            <code className="font-mono text-xs">{OAUTH_AUTHORIZE_PATH}</code>{" "}
            com <code className="font-mono text-xs">client_id</code>,{" "}
            <code className="font-mono text-xs">redirect_uri</code>,{" "}
            <code className="font-mono text-xs">state</code> e{" "}
            <code className="font-mono text-xs">response_type=code</code>.
          </li>
          <li>Este serviço mostra o login e completa o SAML com o ADFS.</li>
          <li>
            A app recebe um <code className="font-mono text-xs">code</code> e
            troca-o em{" "}
            <code className="font-mono text-xs">POST {OAUTH_TOKEN_PATH}</code>{" "}
            por JWT.
          </li>
          <li>
            Claims em{" "}
            <code className="font-mono text-xs">GET {OAUTH_USERINFO_PATH}</code>{" "}
            com Bearer token.
          </li>
        </ol>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app-exemplo"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Abrir app exemplo
        </Link>
        <a
          href="http://localhost:3001"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
        >
          Random App (porta 3001)
        </a>
        <Link
          href="/privado"
          prefetch={false}
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
        >
          Claims da sessão central
        </Link>
        {user ? (
          <SignOutButton />
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
          >
            Entrar neste serviço
          </Link>
        )}
      </div>
    </PageFrame>
  )
}
