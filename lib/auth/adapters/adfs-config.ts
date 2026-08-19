import "server-only"

import { ADFS_CALLBACK_PATH, getAppBaseUrl } from "../config"

export type AdfsRuntimeConfig = {
  entryPoint: string
  idpIssuer: string
  callbackUrl: string
  spIssuer: string
  idpCert: string
  appBaseUrl: string
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} não está definida.`)
  }

  return value
}

export function toPemCertificate(raw: string): string {
  const normalized = raw.replace(/\\n/g, "\n").trim()

  if (normalized.includes("BEGIN CERTIFICATE")) {
    return normalized
  }

  const body = normalized.replace(/\s+/g, "")
  const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body

  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`
}

export function loadAdfsConfig(): AdfsRuntimeConfig {
  const appBaseUrl = getAppBaseUrl()
  const callbackUrl = process.env.ADFS_CALLBACK_URL?.trim() || `${appBaseUrl}${ADFS_CALLBACK_PATH}`
  const spIssuer = process.env.ADFS_SP_ISSUER?.trim() || callbackUrl

  return {
    entryPoint: requiredEnv("ADFS_ENTRY_POINT"),
    idpIssuer: requiredEnv("ADFS_ISSUER"),
    callbackUrl,
    spIssuer,
    idpCert: toPemCertificate(requiredEnv("ADFS_CERT")),
    appBaseUrl,
  }
}
