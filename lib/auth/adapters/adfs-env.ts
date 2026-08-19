import "server-only"

export type AdfsEnv = {
  sessionSecret: string
  appBaseUrl: string
  entryPoint: string
  idpIssuer: string
  callbackUrl: string
  spIssuer: string
  idpCertPem: string | undefined
  metadataUrl: string | undefined
}

function read(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} não está definida no .env.local.`)
  }

  return value
}

/**
 * Lê só as chaves já presentes no .env.local:
 * SESSION_SECRET / NEXTAUTH_SECRET, NEXTAUTH_URL,
 * ADFS_ENTRY_POINT, ADFS_ISSUER, ADFS_CALLBACK_URL,
 * ADFS_SP_ISSUER, ADFS_CERT, ADFS_METADATA_URL.
 */
export function readAdfsEnv(): AdfsEnv {
  const appBaseUrl = required(
    "NEXTAUTH_URL",
    read("NEXTAUTH_URL") ?? read("APP_URL"),
  ).replace(/\/$/, "")

  return {
    sessionSecret: required(
      "SESSION_SECRET",
      read("SESSION_SECRET") ?? read("NEXTAUTH_SECRET"),
    ),
    appBaseUrl,
    entryPoint: required("ADFS_ENTRY_POINT", read("ADFS_ENTRY_POINT")),
    idpIssuer: required("ADFS_ISSUER", read("ADFS_ISSUER")),
    callbackUrl: read("ADFS_CALLBACK_URL") ?? `${appBaseUrl}/api/auth/callback/adfs`,
    spIssuer: read("ADFS_SP_ISSUER") ?? read("ADFS_CALLBACK_URL") ?? `${appBaseUrl}/api/auth/callback/adfs`,
    idpCertPem: read("ADFS_CERT"),
    metadataUrl: read("ADFS_METADATA_URL"),
  }
}

export function isAdfsEnvReady(): boolean {
  return Boolean(
    (read("SESSION_SECRET") ?? read("NEXTAUTH_SECRET")) &&
      (read("NEXTAUTH_URL") ?? read("APP_URL")) &&
      read("ADFS_ENTRY_POINT") &&
      read("ADFS_ISSUER") &&
      (read("ADFS_CERT") || read("ADFS_METADATA_URL")),
  )
}
