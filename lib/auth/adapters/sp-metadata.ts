import { REQUESTED_ADFS_ATTRIBUTE_URIS } from "../claims/adfs-claim-catalog"

export function withRequestedAttributes(metadataXml: string): string {
  const requested = REQUESTED_ADFS_ATTRIBUTE_URIS.map(
    (uri) =>
      `<RequestedAttribute Name="${uri}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" isRequired="false"/>`,
  ).join("")

  const block = `<AttributeConsumingService index="1" isDefault="true"><ServiceName xml:lang="pt">Perfil ADFS</ServiceName>${requested}</AttributeConsumingService>`

  if (metadataXml.includes("AttributeConsumingService")) {
    return metadataXml
  }

  if (metadataXml.includes("</md:SPSSODescriptor>")) {
    return metadataXml.replace("</md:SPSSODescriptor>", `${block}</md:SPSSODescriptor>`)
  }

  return metadataXml.replace("</SPSSODescriptor>", `${block}</SPSSODescriptor>`)
}
