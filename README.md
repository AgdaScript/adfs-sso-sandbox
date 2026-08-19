Sandbox Next.js com autenticação simples, responsabilidades isoladas (SOLID) e duas páginas: pública e privada. A porta `Authenticator` está pronta para ser trocada por ADFS mais tarde.

## Arranque

Copie o ficheiro de ambiente e gere um segredo de sessão:

```bash
cp .env.example .env.local
openssl rand -base64 32
```

Coloque o valor gerado em `SESSION_SECRET` no `.env.local` e execute:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Login de demo: `demo@local` / `demo123`

- Página pública: `/`
- Página privada: `/privado` (exige sessão)
- Login: `/login`

## Estrutura de auth

As páginas não acedem a cookies nem a JWT. Cada módulo tem uma responsabilidade.

| Camada | Papel |
| --- | --- |
| `lib/auth/ports.ts` | Contratos (Authenticator, SessionService, stores) |
| `lib/auth/adapters/` | JWT, cookies, utilizadores em memória, verificação de password |
| `lib/auth/use-cases/` | Sign-in e sign-out |
| `lib/auth/dal.ts` | Verificação segura da sessão nos Server Components |
| `proxy.ts` | Redirect otimista — não é a fronteira de segurança |
| `app/actions/auth.ts` | Adaptador HTTP fino (formulários) |

Para passar a ADFS, implemente `Authenticator` e mantenha as páginas, a DAL e o fluxo de cookie de sessão.




ngrok http 3000 --url=disorder-enticing-pouncing.ngrok-free.dev