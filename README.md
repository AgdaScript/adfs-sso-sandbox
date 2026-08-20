Este projeto é um **microsserviço SSO** entre o ADFS e outras aplicações.

As apps internas **não falam com o ADFS**. Redirecionam o utilizador para este serviço, que trata do SAML e devolve um código de autorização trocável por JWT.

```
App A / App B  →  /oauth/authorize  →  login + ADFS  →  code  →  POST /oauth/token  →  JWT
```

## Arranque

A configuração continua só no `.env.local` (`KEY=value`):

`SESSION_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADFS_ENTRY_POINT`, `ADFS_ISSUER`, `ADFS_CALLBACK_URL`, `ADFS_SP_ISSUER`, `ADFS_CERT`, `ADFS_METADATA_URL`.

1. No ADFS, o ACS do Relying Party é o `ADFS_CALLBACK_URL` **deste** serviço (não o das apps).
2. Metadata SP: `/api/auth/adfs/metadata`
3. `pnpm run dev` em `localhost:3000` e ngrok nessa porta.
4. Abra sempre o host do `NEXTAUTH_URL` (ngrok).

## Como uma aplicação pede login

1. Redirect do browser para:

`GET /oauth/authorize?response_type=code&client_id=app-exemplo&redirect_uri={url-registada}&state={csrf}`

2. Se ainda não houver sessão neste serviço, aparece o formulário de login e o SAML com o ADFS.
3. O utilizador volta à app em `{redirect_uri}?code=...&state=...`
4. A app (backend) troca o code:

`POST /oauth/token` (`application/x-www-form-urlencoded`)

- `grant_type=authorization_code`
- `code`
- `redirect_uri` (o mesmo do passo 1)
- `client_id`
- `client_secret`

Resposta: `access_token`, `id_token`, `token_type`, `expires_in`.

5. Claims: `GET /oauth/userinfo` com `Authorization: Bearer {access_token}`.

## Logout em todas as apps

`GET /oauth/logout?post_logout_redirect_uri={url-da-app}`

1. Invalida a sessão central deste serviço.
2. Visita o `logoutUri` de cada cliente (a Random App usa `/auth/logout`).
3. Faz Single Logout no ADFS.
4. Volta à `post_logout_redirect_uri`.

Sair numa app ou neste serviço desloga todas.

Clientes já registados:

- `app-exemplo` (demo neste serviço). Redirect: `{NEXTAUTH_URL}/app-exemplo/callback`.
- `random-app` (`adfs-sso-random-app` na porta 3001). Redirect: `SSO_RANDOM_APP_REDIRECT_URI` (por omissão `http://localhost:3001/auth/callback`). Secret: `SSO_RANDOM_APP_CLIENT_SECRET`.

Várias apps: `SSO_CLIENTS` (JSON) no `.env.local` (faz merge; o mesmo `id` substitui).

## Páginas deste serviço

| Rota | Papel |
| --- | --- |
| `/` | Contrato do broker |
| `/login` | Formulário que inicia o ADFS |
| `/oauth/deny` | Cancela o pedido e devolve `error` à app de origem |
| `/app-exemplo` | App cliente de teste neste serviço |
| `/privado` | Claims da sessão central (debug) |

A aplicação genérica `adfs-sso-random-app` corre à parte (`localhost:3001`). Só entra em `/privado` se este serviço devolver um código válido após o ADFS.

## Estrutura

| Camada | Papel |
| --- | --- |
| `lib/auth` | SAML ADFS + sessão central deste serviço |
| `lib/sso` | OAuth para as outras aplicações |
| `app/oauth/authorize` | Entrada das apps |
| `app/oauth/token` | Troca code → JWT |
| `app/oauth/userinfo` | Claims do access token |
| `app/oauth/logout` | Logout global (apps + ADFS) |
| `app/api/auth/callback/adfs` | ACS SAML (só este serviço) |
sequenceDiagram
  participant App as Random App :3001
  participant SSO as Microsserviço SSO
  participant ADFS as ADFS
  App->>App: GET /privado (sem sessão)
  App->>SSO: GET /oauth/authorize
  SSO->>SSO: Ecrã /login
  SSO->>ADFS: SAML (credenciais no ADFS)
  alt OK
    ADFS->>SSO: Asserção SAML
    SSO->>App: redirect ?code=
    App->>SSO: POST /oauth/token
    SSO-->>App: JWT
    App->>App: Abre /privado
  else Recusado / cancelado
    SSO->>App: redirect ?error=
    App->>App: /privado continua protegida
  end
