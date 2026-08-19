import "server-only"

import { readAdfsEnv } from "./adfs-env"
import { AdfsFederationMetadataReader } from "./adfs-metadata-reader"
import { toPemCertificate, uniquePemCertificates } from "./pem-certificate"

export type AdfsRuntimeConfig = {
  entryPoint: string
  idpIssuer: string
  callbackUrl: string
  spIssuer: string
  idpCert: string | string[]
  logoutCallbackUrl: string
}

export async function loadAdfsConfig(
  metadataReader = new AdfsFederationMetadataReader(),
): Promise<AdfsRuntimeConfig> {
  const env = readAdfsEnv()
  const certificates: string[] = []

  if (env.idpCertPem) {
    certificates.push(toPemCertificate(env.idpCertPem))
  }

  if (env.metadataUrl) {
    try {
      const fromMetadata = await metadataReader.readSigningCertificates(env.metadataUrl)
      certificates.push(...fromMetadata)
    } catch (error) {
      if (!env.idpCertPem) {
        throw error
      }

      console.error(
        "ADFS_METADATA_URL indisponível; a usar ADFS_CERT do .env.local.",
        error instanceof Error ? error.message : "erro desconhecido",
      )
    }
  }

  const idpCert = uniquePemCertificates(certificates)

  if (idpCert.length === 0) {
    throw new Error("Defina ADFS_CERT ou ADFS_METADATA_URL no .env.local.")
  }

  return {
    entryPoint: env.entryPoint,
    idpIssuer: env.idpIssuer,
    callbackUrl: env.callbackUrl,
    spIssuer: env.spIssuer,
    idpCert: idpCert.length === 1 ? idpCert[0] : idpCert,
    logoutCallbackUrl: `${env.appBaseUrl}/api/auth/adfs/logout`,
  }
}
