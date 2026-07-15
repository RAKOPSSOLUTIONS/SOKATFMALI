import { COMPANY, parseItems, computeTotals, formatFCFA, formatDate, STATUS_LABEL } from "@/lib/finance";

type Doc = {
  number: string;
  status: string;
  date: Date;
  validUntil?: Date | null;
  dueDate?: Date | null;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  items: string;
  taxRate: number;
  discount: number;
  notes?: string | null;
};

type Settings = {
  logoUrl?: string | null;
  bankDetails?: string | null;
  paymentTerms?: string | null;
  documentFooter?: string | null;
};

export function DocumentView({
  doc,
  kind,
  paid = 0,
  settings,
}: {
  doc: Doc;
  kind: "DEVIS" | "FACTURE";
  paid?: number;
  settings?: Settings;
}) {
  const items = parseItems(doc.items);
  const { subtotal, discount, tax, total } = computeTotals(items, doc.taxRate, doc.discount);
  const balance = total - paid;
  const secondDate = kind === "DEVIS" ? doc.validUntil : doc.dueDate;
  const secondLabel = kind === "DEVIS" ? "Valable jusqu'au" : "Échéance";

  return (
    <div id="printable" className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b-2 border-primary">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={COMPANY.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="h-9 w-9 rounded bg-primary grid place-items-center text-on-primary font-black">S</span>
            )}
            <span className="font-headline-md text-headline-md font-black text-primary">{COMPANY.name}</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">{COMPANY.tagline}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{COMPANY.address}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tél : {COMPANY.phone}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{COMPANY.email}</p>
        </div>
        <div className="sm:text-right">
          <h1 className="font-headline-xl text-headline-xl text-primary">{kind}</h1>
          <p className="font-headline-md text-headline-md text-secondary">{doc.number}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">Date : {formatDate(doc.date)}</p>
          {secondDate && <p className="font-body-sm text-body-sm text-on-surface-variant">{secondLabel} : {formatDate(secondDate)}</p>}
          <span className="badge bg-surface-container-high text-on-surface mt-3 inline-flex">{STATUS_LABEL[doc.status] ?? doc.status}</span>
        </div>
      </div>

      {/* Client */}
      <div className="py-6">
        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Adressé à</div>
        <div className="font-headline-md text-headline-md text-primary">{doc.clientName}</div>
        {doc.clientCompany && <div className="font-body-md text-body-md text-on-surface">{doc.clientCompany}</div>}
        {doc.clientAddress && <div className="font-body-sm text-body-sm text-on-surface-variant">{doc.clientAddress}</div>}
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          {[doc.clientPhone, doc.clientEmail].filter(Boolean).join(" · ")}
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low">
            <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Description</th>
            <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right w-20">Qté</th>
            <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right w-36">P.U.</th>
            <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right w-40">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={4} className="p-4 text-center font-body-sm text-body-sm text-on-surface-variant">Aucune ligne.</td></tr>
          )}
          {items.map((it, i) => (
            <tr key={i} className="border-b border-outline-variant">
              <td className="p-3 font-body-md text-body-md text-on-surface">{it.description}</td>
              <td className="p-3 text-right font-body-md text-body-md">{it.quantity}</td>
              <td className="p-3 text-right font-body-md text-body-md">{formatFCFA(it.unitPrice)}</td>
              <td className="p-3 text-right font-body-md text-body-md">{formatFCFA(it.quantity * it.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-6">
        <div className="w-full sm:w-80 space-y-2 font-body-md text-body-md">
          <div className="flex justify-between"><span className="text-on-surface-variant">Sous-total</span><span>{formatFCFA(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Remise</span><span>− {formatFCFA(discount)}</span></div>}
          <div className="flex justify-between"><span className="text-on-surface-variant">TVA ({doc.taxRate}%)</span><span>{formatFCFA(tax)}</span></div>
          <div className="flex justify-between font-headline-md text-headline-md text-primary pt-2 border-t-2 border-primary">
            <span>Total TTC</span><span>{formatFCFA(total)}</span>
          </div>
          {kind === "FACTURE" && (
            <>
              <div className="flex justify-between pt-1"><span className="text-on-surface-variant">Payé</span><span>{formatFCFA(paid)}</span></div>
              <div className="flex justify-between font-label-md text-label-md">
                <span>Reste à payer</span>
                <span className={balance > 0.5 ? "text-error" : "text-secondary"}>{formatFCFA(balance)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {doc.notes && (
        <div className="mt-8 pt-4 border-t border-outline-variant">
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Notes</div>
          <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap">{doc.notes}</p>
        </div>
      )}

      {/* Payment details (invoices) */}
      {kind === "FACTURE" && settings?.bankDetails && (
        <div className="mt-6 p-4 rounded-lg bg-surface-container-low">
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Coordonnées de paiement</div>
          <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap">{settings.bankDetails}</p>
        </div>
      )}

      {/* Terms */}
      {settings?.paymentTerms && (
        <div className="mt-4">
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Conditions</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{settings.paymentTerms}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-outline-variant text-center font-label-sm text-label-sm text-on-surface-variant">
        {COMPANY.name} — NIF : {COMPANY.nif} · RCCM : {COMPANY.rccm}
        <div className="mt-1">{settings?.documentFooter || "Merci de votre confiance."}</div>
      </div>
    </div>
  );
}
