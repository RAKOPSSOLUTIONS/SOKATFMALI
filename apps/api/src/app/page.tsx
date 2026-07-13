import Link from "next/link";

const ENDPOINTS = [
  { method: "GET", path: "/api/health", desc: "État du service et de la base." },
  { method: "GET", path: "/api/sectors", desc: "Secteurs publiés (consommé par le site)." },
  { method: "POST", path: "/api/contact", desc: "Soumission du formulaire de contact." },
  { method: "POST", path: "/api/quote", desc: "Demande de devis." },
];

export default function Home() {
  return (
    <main className="min-h-screen max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full mb-6">
        <span className="material-symbols-outlined text-[18px]">dns</span>
        <span className="font-label-sm text-label-sm uppercase tracking-wider">
          API en ligne
        </span>
      </div>
      <h1 className="font-headline-xl text-headline-xl text-primary mb-4">
        SOKATF-SARL — Backend
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10">
        Service Next.js du portail multiservices : API publique consommée par le
        site Astro et tableau de bord d&apos;administration des prospects, des
        secteurs et des réalisations.
      </p>

      <div className="flex flex-wrap gap-4 mb-14">
        <Link href="/admin" className="btn-primary">
          <span className="material-symbols-outlined">admin_panel_settings</span>
          Tableau de bord
        </Link>
        <a href="/api/health" className="btn-outline">
          <span className="material-symbols-outlined">monitor_heart</span>
          Vérifier l&apos;état
        </a>
      </div>

      <h2 className="font-headline-md text-headline-md text-primary mb-4">
        Points d&apos;accès
      </h2>
      <div className="card divide-y divide-outline-variant overflow-hidden">
        {ENDPOINTS.map((e) => (
          <div key={e.path} className="flex items-center gap-4 p-4">
            <span
              className={`badge ${
                e.method === "GET"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-tertiary-fixed text-on-tertiary-fixed"
              }`}
            >
              {e.method}
            </span>
            <code className="font-mono text-body-sm text-on-surface">{e.path}</code>
            <span className="font-body-sm text-body-sm text-on-surface-variant ml-auto hidden sm:block">
              {e.desc}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
