Sandbox Next.js com SSO SAML contra ADFS. O protocolo SAML fica encapsulado atrás de portas (SOLID); as páginas só conhecem login/sessão.

Fluxo: **página pública → login ADFS (credenciais do IdP) → página privada**.

## Arranque

1. Copie `.env.example` para `.env.local` e preencha o ADFS (entry point, issuer, certificado, callback público).
2. No ADFS, o Relying Party deve apontar o ACS para `/api/auth/callback/adfs` (o mesmo valor de `ADFS_CALLBACK_URL`).
3. Metadata do SP: `/api/auth/adfs/metadata`
4. `npm run dev` (ou `pnpm run dev`) e use a URL pública (ngrok) definida em `APP_URL` / `NEXTAUTH_URL`.

- Pública: `/`
- Login: `/login` → redireciona ao ADFS
- Privada: `/privado`

## Estrutura

| Camada | Papel |
| --- | --- |
| `lib/auth/ports.ts` | Contrato `SsoIdentityProvider` + `SessionService` |
| `lib/auth/adapters/adfs-saml-provider.ts` | `@node-saml/node-saml` (SAML 2.0 / ADFS) |
| `lib/auth/use-cases/` | Iniciar SSO e completar o ACS |
| `lib/auth/dal.ts` | Verificação segura da sessão nas páginas |
| `app/api/auth/adfs/login` | Redirect para o IdP |
| `app/api/auth/callback/adfs` | POST ACS: valida asserção e cria cookie |
| `proxy.ts` | Redirect otimista — não é a fronteira de segurança |

Auth.js / NextAuth não trazem SAML de primeira linha. `@node-saml/node-saml` é a biblioteca Node usada para ADFS; aqui entra só como adaptador, sem as páginas dependerem dela.
