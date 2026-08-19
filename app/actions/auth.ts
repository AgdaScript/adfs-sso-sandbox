"use server"

import { redirect } from "next/navigation"

import { LOGIN_PATH, PRIVATE_HOME_PATH } from "@/lib/auth/config"
import { auth } from "@/lib/auth/container"

export type SignInFormState = {
  error?: string
}

export async function signInAction(
  _state: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const result = await auth.signIn({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  })

  if (!result.ok) {
    return {
      error:
        result.error === "invalid_input"
          ? "Preencha o email e a palavra-passe."
          : "Credenciais inválidas.",
    }
  }

  redirect(PRIVATE_HOME_PATH)
}

export async function signOutAction(): Promise<void> {
  await auth.signOut()
  redirect(LOGIN_PATH)
}
