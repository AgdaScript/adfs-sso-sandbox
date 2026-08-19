import "server-only"

import { toPemCertificate } from "./pem-certificate"

export class AdfsFederationMetadataReader {
  async readSigningCertificates(metadataUrl: string): Promise<string[]> {
    const response = await fetch(metadataUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/xml, text/xml, */*" },
    })

    if (!response.ok) {
      throw new Error(`Não foi possível ler ADFS_METADATA_URL (${response.status}).`)
    }

    const xml = await response.text()
    const matches = xml.matchAll(/<X509Certificate>([^<]+)<\/X509Certificate>/gi)
    const certs = [...matches].map((match) => toPemCertificate(match[1]))

    if (certs.length === 0) {
      throw new Error("ADFS_METADATA_URL não contém certificados X509.")
    }

    return certs
  }
}
