import "server-only"

export function toPemCertificate(raw: string): string {
  const normalized = raw.replace(/\\n/g, "\n").trim()

  if (normalized.includes("BEGIN CERTIFICATE")) {
    return normalized
  }

  const body = normalized.replace(/\s+/g, "")
  const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body

  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`
}

export function uniquePemCertificates(values: string[]): string[] {
  return [...new Set(values.map((value) => toPemCertificate(value)))]
}
