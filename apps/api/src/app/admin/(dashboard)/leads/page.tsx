import { ConfirmSubmit, ExportButton } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/constants";
import { updateLeadStatus, deleteLead } from "../../actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-tertiary-fixed text-on-tertiary-fixed",
  IN_PROGRESS: "bg-secondary-container text-on-secondary-container",
  CLOSED: "bg-surface-container-high text-on-surface-variant",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; status?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const type = sp.type;
  const status = sp.status;
  const where = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };
  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Prospects</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {leads.length} enregistrement{leads.length > 1 ? "s" : ""}.
          </p>
        </div>
        <ExportButton
          filename="prospects-sokatf"
          headers={["Type", "Statut", "Nom", "Email", "Téléphone", "Société", "Secteur", "Budget", "Message", "Date"]}
          rows={leads.map((l) => [l.type, l.status, l.name, l.email, l.phone ?? "", l.company ?? "", l.sector ?? "", l.budget ?? "", l.message, new Date(l.createdAt).toLocaleString("fr-FR")])}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterLink label="Tous" href="/admin/leads" active={!type && !status} />
        <FilterLink label="Contacts" href="/admin/leads?type=CONTACT" active={type === "CONTACT"} />
        <FilterLink label="Devis" href="/admin/leads?type=QUOTE" active={type === "QUOTE"} />
        <FilterLink label="Nouveaux" href="/admin/leads?status=NEW" active={status === "NEW"} />
      </div>

      {leads.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
            inbox
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Aucun prospect ne correspond au filtre.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <span className="badge bg-surface-container-high text-on-surface">
                  {l.type}
                </span>
                <span className={`badge ${STATUS_STYLE[l.status] ?? ""}`}>
                  {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant ml-auto">
                  {new Date(l.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 mb-4">
                <Field label="Nom" value={l.name} />
                <Field label="Email" value={l.email} />
                {l.phone && <Field label="Téléphone" value={l.phone} />}
                {l.company && <Field label="Société" value={l.company} />}
                {l.sector && <Field label="Secteur" value={l.sector} />}
                {l.budget && <Field label="Budget" value={l.budget} />}
                {l.source && <Field label="Source" value={l.source} />}
              </div>

              <p className="font-body-md text-body-md text-on-surface bg-surface-container-low rounded-lg p-4 mb-4 whitespace-pre-wrap">
                {l.message}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <form action={updateLeadStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <select
                    name="status"
                    defaultValue={l.status}
                    className="input py-2 w-auto"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-outline py-2">
                    Mettre à jour
                  </button>
                </form>
                <a href={`mailto:${l.email}`} className="btn-outline py-2">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Répondre
                </a>
                <form action={deleteLead} className="ml-auto">
                  <input type="hidden" name="id" value={l.id} />
                  <ConfirmSubmit message={`Supprimer le prospect « ${l.name} » ?`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1">
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mr-2">
        {label}
      </span>
      <span className="font-body-md text-body-md text-on-surface">{value}</span>
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`badge px-4 py-2 ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container-high text-on-surface-variant hover:text-primary"
      }`}
    >
      {label}
    </a>
  );
}
