import { PageFrame } from "@/app/components/page-frame"
import { SignOutButton } from "@/app/components/sign-out-button"
import {
  ADFS_CONTACT_FIELDS,
  ADFS_DIRECTORY_FIELDS,
  ADFS_GROUP_FIELDS,
  ADFS_IDENTITY_FIELDS,
  ALL_ADFS_CLAIM_FIELDS,
} from "@/lib/auth/claims/adfs-claim-catalog"
import { toFieldViews, unusedClaims } from "@/lib/auth/claims/adfs-profile-view"
import { requireUser } from "@/lib/auth/dal"

function FieldList({
  title,
  fields,
}: {
  title: string
  fields: Array<{ id: string; label: string; value: string | undefined }>
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <dl className="grid gap-3 text-sm">
        {fields.map((field) => (
          <div key={field.id}>
            <dt className="text-zinc-500">{field.label}</dt>
            <dd className={field.value ? "break-all font-medium" : "text-zinc-400"}>
              {field.value ?? "Não enviado pelo ADFS"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default async function PrivatePage() {
  const user = await requireUser()
  const identity = toFieldViews(user.claims, ADFS_IDENTITY_FIELDS)
  const directory = toFieldViews(user.claims, ADFS_DIRECTORY_FIELDS)
  const contact = toFieldViews(user.claims, ADFS_CONTACT_FIELDS)
  const groups = toFieldViews(user.claims, ADFS_GROUP_FIELDS)
  const extras = unusedClaims(user.claims, ALL_ADFS_CLAIM_FIELDS)

  return (
    <PageFrame
      badge="Privada"
      title="Perfil ADFS"
      description="Dados da asserção SAML desta sessão. Campos vazios não foram emitidos pelo Relying Party — é preciso acrescentar Issuance Transform Rules no ADFS."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Nome (sessão)</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Email (sessão)</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">NameID</dt>
            <dd className="break-all font-mono text-xs">{user.id}</dd>
          </div>
        </dl>
      </section>
      <FieldList title="Identidade" fields={identity} />
      <FieldList title="Diretório" fields={directory} />
      <FieldList title="Contacto" fields={contact} />
      <FieldList title="Grupos e roles" fields={groups} />
      {extras.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold">Outras claims</h2>
          <dl className="grid gap-3 text-sm">
            {extras.map((claim) => (
              <div key={claim.key}>
                <dt className="break-all font-mono text-xs text-zinc-500">{claim.key}</dt>
                <dd className="break-all font-medium">{claim.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <SignOutButton />
    </PageFrame>
  )
}
