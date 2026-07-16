import { getSiteContent } from "@/lib/siteContent";
import { updateSiteContent } from "../../site-actions";
import { SiteContentForm } from "../../_components/SiteContentForm";

export const dynamic = "force-dynamic";

export default async function SitePage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Contenu du site</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Textes et éléments de la page d'accueil, à propos, partenaires et coordonnées.
        </p>
      </div>
      <SiteContentForm content={content} action={updateSiteContent} />
    </div>
  );
}
