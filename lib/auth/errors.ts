export class SsoAuthenticationError extends Error {
  readonly cause?: unknown

  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = "SsoAuthenticationError"
    this.cause = options?.cause
  }
}
