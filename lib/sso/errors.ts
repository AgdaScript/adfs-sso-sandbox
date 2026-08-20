export class BrokerAuthorizationError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "BrokerAuthorizationError"
    this.code = code
  }
}
