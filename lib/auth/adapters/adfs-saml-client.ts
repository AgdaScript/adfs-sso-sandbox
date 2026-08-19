import "server-only"

import { SAML } from "@node-saml/node-saml"

import type { AdfsRuntimeConfig } from "./adfs-config"

export function createAdfsSamlClient(config: AdfsRuntimeConfig): SAML {
  return new SAML({
    callbackUrl: config.callbackUrl,
    entryPoint: config.entryPoint,
    issuer: config.spIssuer,
    audience: config.spIssuer,
    idpIssuer: config.idpIssuer,
    idpCert: config.idpCert,
    logoutUrl: config.entryPoint,
    logoutCallbackUrl: config.logoutCallbackUrl,
    identifierFormat: null,
    disableRequestedAuthnContext: true,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
    acceptedClockSkewMs: 5 * 60 * 1000,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
  })
}
