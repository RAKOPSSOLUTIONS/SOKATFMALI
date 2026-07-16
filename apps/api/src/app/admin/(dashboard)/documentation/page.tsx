import { DOCS } from "@/lib/orgDocs";

export const dynamic = "force-dynamic";

// A representative icon per document (falls back to a generic one).
const ICONS: Record<string, string> = {
  organigramme: "account_tree",
  presentation: "slideshow",
  objectifs: "target",
  "fiches-poste": "badge",
  "reglement-interieur": "gavel",
  "politique-rh": "diversity_3",
  "charte-informatique": "shield_lock",
  "politique-confidentialite": "privacy_tip",
  "procedure-documents": "rule_folder",
  "plan-sauvegarde": "backup",
  "plan-communication": "campaign",
  "business-plan": "trending_up",
  "plan-action": "checklist",
  kpi: "monitoring",
  "conditions-generales-vente": "receipt_long",
  "procedure-achats": "shopping_cart_checkout",
  "gestion-stocks": "inventory",
  "code-conduite": "balance",
  "politique-qualite": "verified",
  "politique-hse": "health_and_safety",
  "procedure-recrutement": "person_search",
  "plan-formation": "school",
};

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 grid place-items-center text-primary">
          <span className="material-symbols-outlined">folder_open</span>
        </span>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Documentation</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            {DOCS.length} documents d'organisation, à jour et prêts à télécharger en <strong className="text-primary">PDF</strong> ou <strong className="text-primary">Word</strong>.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOCS.map((d) => (
          <div
            key={d.slug}
            className="group card p-5 flex flex-col gap-4 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="h-11 w-11 shrink-0 rounded-lg bg-secondary-container grid place-items-center text-on-secondary-container">
                <span className="material-symbols-outlined">{ICONS[d.slug] ?? "description"}</span>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-label-lg text-label-lg font-bold text-primary leading-snug">{d.title}</h2>
                {d.subtitle && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{d.subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-2 border-t border-outline-variant">
              <a
                href={`/admin/documentation/${d.slug}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error bg-error-container/40 hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> PDF
              </a>
              <a
                href={`/admin/documentation/${d.slug}/docx`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-secondary bg-secondary-container/50 hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">description</span> Word
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Le contenu se modifie dans <code className="font-mono text-body-sm bg-surface-container-high px-1.5 py-0.5 rounded">src/lib/orgDocs.ts</code>, puis régénération automatique à l'ouverture.
      </p>
    </div>
  );
}
