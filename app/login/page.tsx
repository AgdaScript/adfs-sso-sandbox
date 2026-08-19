import { ADFS_LOGIN_PATH, isAdfsConfigured } from "@/lib/auth/config"
import { PageFrame } from "@/app/components/page-frame"

type LoginPageProps = PageProps<"/login">

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : undefined
  const from = typeof params.from === "string" ? params.from : undefined
  const configured = isAdfsConfigured()
  const loginHref = from
    ? `${ADFS_LOGIN_PATH}?from=${encodeURIComponent(from)}`
    : ADFS_LOGIN_PATH

  return (
    <PageFrame
      badge="ADFS SAML"
      title="Entrar com ADFS"
      description="A página pública leva-o a este login. As credenciais são as registadas no ADFS — o IdP autentica e devolve a asserção SAML para abrir a página privada."
    >
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          Não foi possível autenticar com o ADFS. Confirme o Relying Party, o
          callback e o certificado.
        </p>
      ) : null}

      {configured ? (
        <a
          href={loginHref}
          className="inline-flex w-fit rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Entrar com ADFS
        </a>
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
