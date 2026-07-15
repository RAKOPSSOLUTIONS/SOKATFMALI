import { getSettings } from "@/lib/settings";
import { updateSettings } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const s = await getSettings();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Paramètres</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Personnalisez le branding et les valeurs par défaut de vos devis et factures.
        </p>
      </div>

      <form action={updateSettings} className="card p-6 space-y-5">
        <div>
          <label className="label">Nom de l'entreprise</label>
          <input name="companyName" defaultValue={s.companyName} className="input" />
        </div>
        <div>
          <label className="label">Logo — URL d'image (affiché sur les documents)</label>
          <input name="logoUrl" defaultValue={s.logoUrl ?? ""} className="input" placeholder="https://sokatf.com/logo.png" />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Laissez vide pour utiliser le monogramme par défaut.</p>
        </div>
        <div>
          <label className="label">TVA par défaut (%)</label>
          <input name="defaultTaxRate" type="number" step="0.1" min="0" defaultValue={s.defaultTaxRate} className="input w-40" />
        </div>
        <div>
          <label className="label">Coordonnées de paiement (RIB / IBAN / Mobile Money)</label>
          <textarea name="bankDetails" rows={3} defaultValue={s.bankDetails ?? ""} className="input" placeholder={"Banque de … — RIB : ML00 0000 0000\nOrange Money : +223 …"} />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Affiché sur les factures pour faciliter le règlement.</p>
        </div>
        <div>
          <label className="label">Conditions de paiement (par défaut)</label>
          <textarea name="paymentTerms" rows={3} defaultValue={s.paymentTerms ?? ""} className="input" placeholder="Paiement à 30 jours. Validité du devis : 30 jours." />
        </div>
        <div>
          <label className="label">Mention de bas de page</label>
          <input name="documentFooter" defaultValue={s.documentFooter ?? ""} className="input" placeholder="Merci de votre confiance." />
        </div>
        <button className="btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}
