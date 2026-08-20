import { cookies } from "next/headers"
import Link from "next/link"

import { PageFrame } from "@/app/components/page-frame"
import { getAppBaseUrl } from "@/lib/auth/config"
import { DEFAULT_CLIENT_ID, DEMO_APP_CALLBACK_PATH, getDefaultClientSecret } from "@/lib/sso/config"
import { sso } from "@/lib/sso/container"

type CallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DemoAppCallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : undefined
  const code = typeof params.code === "string" ? params.code : undefined
  const state = typeof params.state === "string" ? params.state : undefined
  const expectedState = (await cookies()).get("demo_oauth_state")?.value

  if (error) {
    return (
      <PageFrame badge="Aplicação cliente" title="Login recusado" description="O SSO Service devolveu um erro.">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Link href="/app-exemplo" className="text-sm underline">
          Tentar outra vez
        </Link>
      </PageFrame>
    )
  }

  if (!code || !state || state !== expectedState) {
    return (
      <PageFrame badge="Aplicação cliente" title="Callback inválido" description="O state ou o código não batem certo.">
        <Link href="/app-exemplo" className="text-sm underline">
          Voltar a pedir login
        </Link>
      </PageFrame>
    )
  }

  try {
    const tokens = await sso.exchangeAuthorizationCode({
      grantType: "authorization_code",
      code,
      redirectUri: `${getAppBaseUrl()}${DEMO_APP_CALLBACK_PATH}`,
      clientId: process.env.SSO_CLIENT_ID ?? DEFAULT_CLIENT_ID,
      clientSecret: getDefaultClientSecret(),
    })
    const userinfo = await sso.tokens.verifyAccessToken(tokens.accessToken)

    return (
      <PageFrame
        badge="Aplicação cliente"
        title="Acesso concedido"
        description="O microsserviço autenticou no ADFS e emitiu tokens para esta aplicação."
      >
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-zinc-500">Nome</dt>
              <dd className="font-medium">{userinfo?.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium">{userinfo?.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">sub</dt>
              <dd className="break-all font-mono text-xs">{userinfo?.sub}</dd>
            </div>
          </dl>
        </section>
        <Link href="/app-exemplo" className="text-sm underline">
          Nova entrada
        </Link>
      </PageFrame>
    )
  } catch (exchangeError) {
    return (
      <PageFrame badge="Aplicação cliente" title="Falha a obter tokens" description="O código não pôde ser trocado.">
        <p className="text-sm text-red-600 dark:text-red-400">
          {exchangeError instanceof Error ? exchangeError.message : "erro desconhecido"}
        </p>
        <Link href="/app-exemplo" className="text-sm underline">
          Tentar outra vez
        </Link>
      </PageFrame>
    )
  }
}
