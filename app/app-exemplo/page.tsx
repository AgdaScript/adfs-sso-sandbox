import Link from "next/link"

import { PageFrame } from "@/app/components/page-frame"
import { OAUTH_AUTHORIZE_PATH } from "@/lib/sso/config"

export default function DemoAppPage() {
  return (
    <PageFrame
      badge="Aplicação cliente"
      title="App Exemplo"
      description="Simula outra aplicação: não fala com o ADFS. Pede login ao microsserviço SSO e recebe um código trocável por JWT."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="leading-6 text-zinc-700 dark:text-zinc-300">
          Esta página representa um sistema interno. O botão chama{" "}
          <code className="font-mono text-xs">{OAUTH_AUTHORIZE_PATH}</code> neste
          serviço.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app-exemplo/start"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Entrar via SSO Service
        </Link>
        <Link
          href="/"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
        >
          Voltar ao serviço
        </Link>
      </div>
    </PageFrame>
  )
}
