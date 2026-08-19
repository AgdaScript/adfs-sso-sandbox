A app lê a configuração **só** do `.env.local` (formato `KEY=value`):

`SESSION_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADFS_ENTRY_POINT`, `ADFS_ISSUER`, `ADFS_CALLBACK_URL`, `ADFS_SP_ISSUER`, `ADFS_CERT`, `ADFS_METADATA_URL`.

Fluxo: **página pública → login ADFS → página privada**.

## Arranque

1. No ADFS, o Relying Party ACS deve ser o `ADFS_CALLBACK_URL`.
2. Metadata do SP: `/api/auth/adfs/metadata`
3. `pnpm run dev` em `localhost:3000` e o ngrok a apontar para essa porta (`ngrok http 3000 --url=<o-seu-host>`).
4. Abra **sempre** a URL do `NEXTAUTH_URL` (ngrok), não `http://localhost:3000`. O ADFS só vê o túnel público.

O `.env.local` já tem o callback no host ngrok (`ADFS_CALLBACK_URL`). Esse valor tem de coincidir com o ACS do Relying Party no ADFS.

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
