import { PageFrame } from "@/app/components/page-frame"
import { LoginForm } from "@/app/components/login-form"

export default function LoginPage() {
  return (
    <PageFrame
      badge="Autenticação"
      title="Entrar"
      description="Sandbox com credenciais locais. O autenticador está atrás de uma porta (interface), para mais tarde ser trocado por ADFS sem alterar as páginas."
    >
      <LoginForm />
      <p className="text-sm text-zinc-500">
        Demo: <code className="font-mono">demo@local</code> /{" "}
        <code className="font-mono">demo123</code>
      </p>
    </PageFrame>
  )
}
