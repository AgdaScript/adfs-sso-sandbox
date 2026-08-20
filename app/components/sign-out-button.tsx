import { OAUTH_LOGOUT_PATH } from "@/lib/sso/config"

export function SignOutButton() {
  return (
    <form action={OAUTH_LOGOUT_PATH} method="get">
      <button
        type="submit"
        className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        Sair
      </button>
    </form>
  )
}
