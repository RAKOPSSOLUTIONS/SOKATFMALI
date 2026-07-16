import { COMPANY, parseItems, computeTotals, formatFCFA, formatDate, STATUS_LABEL, STATUS_STYLE } from "@/lib/finance";
import { logoDataUri } from "@/lib/brand";

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
    <div id="printable" className="bg-white text-slate-800 border border-outline-variant rounded-2xl overflow-hidden w-full print:border-0 print:rounded-none">
      {/* Gold accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#0f172a] via-[#b8860b] to-[#fed65b]" />

      <div className="px-8 md:px-12 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b-2 border-[#0f172a]">
          <div>
            <img src={settings?.logoUrl || logoDataUri("black")} alt={COMPANY.name} className="h-10 w-auto object-contain mb-4" />
            <p className="text-[13px] text-slate-600 max-w-xs leading-relaxed">{COMPANY.tagline}</p>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">{COMPANY.address}</p>
            <p className="text-[12px] text-slate-500">Tél : {COMPANY.phone} · {COMPANY.email}</p>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-3xl font-black tracking-tight text-[#0f172a]">{kind}</div>
            <div className="text-lg font-bold mt-1 text-[#b8860b]">{doc.number}</div>
            <span className={`badge mt-3 inline-flex ${STATUS_STYLE[doc.status] ?? "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABEL[doc.status] ?? doc.status}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-12 py-8">
        {/* Client + dates */}
        <div className="grid sm:grid-cols-3 gap-6 pb-8 border-b border-outline-variant">
          <div className="sm:col-span-2">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">Adressé à</div>
            <div className="text-lg font-bold text-[#0f172a]">{doc.clientName}</div>
            {doc.clientCompany && <div className="text-sm text-slate-600">{doc.clientCompany}</div>}
            {doc.clientAddress && <div className="text-sm text-slate-500 mt-1">{doc.clientAddress}</div>}
            <div className="text-sm text-slate-500">{[doc.clientPhone, doc.clientEmail].filter(Boolean).join(" · ")}</div>
          </div>
          <div className="sm:text-right space-y-2">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400">Date</div>
              <div className="text-sm font-semibold text-slate-700">{formatDate(doc.date)}</div>
            </div>
            {secondDate && (
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-400">{secondLabel}</div>
                <div className="text-sm font-semibold text-slate-700">{formatDate(secondDate)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="text-[11px] uppercase tracking-wider font-semibold p-3 rounded-l-lg">Description</th>
                <th className="text-[11px] uppercase tracking-wider font-semibold p-3 text-right w-20">Qté</th>
                <th className="text-[11px] uppercase tracking-wider font-semibold p-3 text-right w-36">P.U.</th>
                <th className="text-[11px] uppercase tracking-wider font-semibold p-3 text-right w-40 rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-400">Aucune ligne.</td></tr>
              )}
              {items.map((it, i) => (
                <tr key={i} className={i % 2 ? "bg-slate-50" : ""}>
                  <td className="p-3 text-sm text-slate-800">{it.description}</td>
                  <td className="p-3 text-right text-sm">{it.quantity}</td>
                  <td className="p-3 text-right text-sm">{formatFCFA(it.unitPrice)}</td>
                  <td className="p-3 text-right text-sm font-semibold">{formatFCFA(it.quantity * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-96">
            <div className="space-y-2 text-sm px-4">
              <div className="flex justify-between"><span className="text-slate-500">Sous-total</span><span>{formatFCFA(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Remise</span><span>− {formatFCFA(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">TVA ({doc.taxRate}%)</span><span>{formatFCFA(tax)}</span></div>
            </div>
            <div className="flex justify-between items-center mt-3 px-4 py-3 rounded-xl bg-[#0f172a] text-white">
              <span className="text-sm font-semibold">Total TTC</span>
              <span className="text-xl font-black text-[#fed65b]">{formatFCFA(total)}</span>
            </div>
            {kind === "FACTURE" && (
              <div className="mt-3 px-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Payé</span><span className="text-emerald-600 font-semibold">{formatFCFA(paid)}</span></div>
                <div className="flex justify-between font-bold">
                  <span>Reste à payer</span>
                  <span className={balance > 0.5 ? "text-red-600" : "text-emerald-600"}>{formatFCFA(balance)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className="mt-8 pt-4 border-t border-outline-variant">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Notes</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{doc.notes}</p>
          </div>
        )}

        {/* Payment details (invoices) */}
        {kind === "FACTURE" && settings?.bankDetails && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-outline-variant">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Coordonnées de paiement</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{settings.bankDetails}</p>
          </div>
        )}

        {/* Terms */}
        {settings?.paymentTerms && (
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Conditions</div>
            <p className="text-sm text-slate-500 whitespace-pre-wrap">{settings.paymentTerms}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-outline-variant text-center text-[12px] text-slate-400">
          <span className="font-semibold text-slate-500">{COMPANY.name}</span> — NIF : {COMPANY.nif} · RCCM : {COMPANY.rccm}
          <div className="mt-1">{settings?.documentFooter || "Merci de votre confiance."}</div>
        </div>
      </div>
    </div>
  );
}
