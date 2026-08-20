import { ADFS_LOGIN_PATH, isAdfsConfigured } from "@/lib/auth/config"
import { PageFrame } from "@/app/components/page-frame"
import { OAUTH_CONTINUE_PATH } from "@/lib/sso/config"

type LoginPageProps = PageProps<"/login">

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : undefined
  const from = typeof params.from === "string" ? params.from : undefined
  const configured = isAdfsConfigured()
  const brokerLogin = from === OAUTH_CONTINUE_PATH

  return (
    <PageFrame
      badge="SSO Service"
      title="Entrar"
      description={
        brokerLogin
          ? "Uma aplicação pediu acesso. Autentique-se no ADFS; este serviço devolve a identidade à aplicação de origem."
          : "As credenciais ficam no ADFS. Este serviço só inicia o SAML e emite a sessão/token."
      }
    >
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          Não foi possível autenticar com o ADFS. Confirme as claims do Relying
          Party (NameID ou email) e tente outra vez.
        </p>
      ) : null}

      {configured ? (
        <form method="post" action={ADFS_LOGIN_PATH} className="grid max-w-md gap-4">
          <input type="hidden" name="from" value={from ?? ""} />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Não introduz password aqui. O formulário envia-o ao ADFS, que
            autentica e devolve a asserção SAML a este microsserviço.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex w-fit rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Continuar para o ADFS
            </button>
            {brokerLogin ? (
              <a
                href="/oauth/deny"
                className="inline-flex w-fit rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium dark:border-zinc-800"
              >
                Cancelar e voltar à aplicação
              </a>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          SSO ADFS não encontrou as variáveis no{" "}
          <code className="font-mono">.env.local</code>{" "}
          (NEXTAUTH_URL, ADFS_ENTRY_POINT, ADFS_ISSUER, ADFS_CERT).
        </p>
      )}
    </PageFrame>
  )
}
