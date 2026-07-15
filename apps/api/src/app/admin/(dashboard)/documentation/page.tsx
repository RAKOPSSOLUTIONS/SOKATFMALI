import { DOCS } from "@/lib/orgDocs";

export const dynamic = "force-dynamic";

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Documentation</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Documents d'organisation de l'entreprise, téléchargeables en PDF et Word. Le contenu se modifie
          dans le code (<code className="font-mono text-body-sm">src/lib/orgDocs.ts</code>).
        </p>
      </div>

      <div className="card divide-y divide-outline-variant overflow-hidden">
        {DOCS.map((d) => (
          <div key={d.slug} className="flex flex-wrap items-center gap-4 p-4">
            <span className="material-symbols-outlined text-secondary">description</span>
            <div className="min-w-0 flex-1">
              <div className="font-label-md text-label-md text-primary truncate">{d.title}</div>
              {d.subtitle && <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{d.subtitle}</div>}
            </div>
            <a href={`/admin/documentation/${d.slug}/pdf`} target="_blank" rel="noopener noreferrer" className="btn-outline py-2">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> PDF
            </a>
            <a href={`/admin/documentation/${d.slug}/docx`} className="btn-outline py-2">
              <span className="material-symbols-outlined text-[18px]">description</span> Word
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
