export type AdfsClaimField = {
  id: string
  label: string
  keys: readonly string[]
}

const CLAIM = {
  email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  upn: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
  givenName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  surname: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
  name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  displayName: "http://schemas.microsoft.com/identity/claims/displayname",
  commonName: "http://schemas.xmlsoap.org/claims/CommonName",
  windowsAccount: "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname",
  role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  group: "http://schemas.xmlsoap.org/claims/Group",
  groupSid: "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid",
  objectId: "http://schemas.microsoft.com/identity/claims/objectidentifier",
  department: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department",
  telephone: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/otherphone",
  homePhone: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/homephone",
  mobile: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone",
  telephoneNumber: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/telephonenumber",
  employeeId: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/employeeid",
  title: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/title",
  locality: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality",
} as const

export const ADFS_IDENTITY_FIELDS: AdfsClaimField[] = [
  { id: "upn", label: "UPN", keys: ["upn", CLAIM.upn] },
  {
    id: "windowsAccountName",
    label: "Conta Windows",
    keys: ["windowsaccountname", "windowsAccountName", CLAIM.windowsAccount],
  },
  { id: "givenName", label: "Nome próprio", keys: ["givenname", "givenName", CLAIM.givenName] },
  { id: "surname", label: "Apelido", keys: ["surname", "sn", CLAIM.surname] },
  {
    id: "displayName",
    label: "Nome de apresentação",
    keys: [
      "displayname",
      "displayName",
      "Display-Name",
      "name",
      CLAIM.displayName,
      CLAIM.name,
      CLAIM.commonName,
    ],
  },
  { id: "email", label: "Email", keys: ["email", "mail", "emailaddress", CLAIM.email] },
]

export const ADFS_DIRECTORY_FIELDS: AdfsClaimField[] = [
  {
    id: "objectGuid",
    label: "Object GUID",
    keys: [
      "objectguid",
      "objectGuid",
      "objectidentifier",
      CLAIM.objectId,
      "http://schemas.microsoft.com/identity/claims/objectguid",
    ],
  },
  { id: "employeeId", label: "Employee ID", keys: ["employeeid", "employeeID", CLAIM.employeeId] },
  { id: "department", label: "Departamento", keys: ["department", "Department", CLAIM.department] },
  { id: "title", label: "Cargo", keys: ["title", "Job Title", CLAIM.title] },
]

export const ADFS_CONTACT_FIELDS: AdfsClaimField[] = [
  {
    id: "telephone",
    label: "Telefone",
    keys: [
      "telephone",
      "telephonenumber",
      "Telephone-Number",
      "phone",
      CLAIM.telephone,
      CLAIM.telephoneNumber,
      CLAIM.homePhone,
    ],
  },
  { id: "mobile", label: "Telemóvel", keys: ["mobile", "mobilephone", CLAIM.mobile] },
]

export const ADFS_GROUP_FIELDS: AdfsClaimField[] = [
  { id: "groups", label: "Grupos", keys: ["Group", "group", "groups", CLAIM.group] },
  { id: "roles", label: "Roles", keys: ["Role", "role", "roles", CLAIM.role] },
  { id: "groupSids", label: "Group SIDs", keys: ["groupsid", CLAIM.groupSid] },
]

export const ALL_ADFS_CLAIM_FIELDS: AdfsClaimField[] = [
  ...ADFS_IDENTITY_FIELDS,
  ...ADFS_DIRECTORY_FIELDS,
  ...ADFS_CONTACT_FIELDS,
  ...ADFS_GROUP_FIELDS,
]

export const REQUESTED_ADFS_ATTRIBUTE_URIS = [
  CLAIM.upn,
  CLAIM.windowsAccount,
  CLAIM.givenName,
  CLAIM.surname,
  CLAIM.name,
  CLAIM.displayName,
  CLAIM.email,
  CLAIM.role,
  CLAIM.group,
  CLAIM.objectId,
  CLAIM.department,
  CLAIM.telephone,
  CLAIM.telephoneNumber,
  CLAIM.mobile,
  CLAIM.employeeId,
  CLAIM.title,
] as const
