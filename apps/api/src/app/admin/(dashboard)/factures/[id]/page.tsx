import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  STATUS_LABEL,
  parseItems,
  computeTotals,
  formatFCFA,
  formatDate,
  waLink,
  docSummary,
} from "@/lib/finance";
import { DocumentView } from "../../../_components/DocumentView";
import { PrintButton } from "../../../_components/PrintButton";
import { getSettings } from "@/lib/settings";
import { setInvoiceStatus, deleteInvoice, addPayment, deletePayment, sendInvoiceEmail, duplicateInvoice } from "../../../finance-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ where: { id }, select: { number: true } });
  return { title: inv?.number ?? "Facture" };
}

export default async function FactureViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { payments: { orderBy: { date: "desc" } } } });
  if (!inv) notFound();

  const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  const balance = total - paid;
  const today = new Date().toISOString().slice(0, 10);
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center gap-3">
        <Link href="/admin/factures" className="font-label-md text-label-md text-on-surface-variant hover:text-primary mr-auto">← Factures</Link>
        <PrintButton />
        <Link href={`/admin/factures/${inv.id}/edit`} className="btn-outline py-2">
          <span className="material-symbols-outlined text-[18px]">edit</span> Modifier
        </Link>
        <form action={duplicateInvoice}>
          <input type="hidden" name="id" value={inv.id} />
          <button className="btn-outline py-2"><span className="material-symbols-outlined text-[18px]">content_copy</span> Dupliquer</button>
        </form>
        <a
          href={waLink(inv.clientPhone, docSummary("FACTURE", inv.number, total, inv.clientName))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline py-2"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
        </a>
        <form action={sendInvoiceEmail}>
          <input type="hidden" name="id" value={inv.id} />
          <button className="btn-outline py-2 disabled:opacity-50" disabled={!inv.clientEmail} title={inv.clientEmail ? "" : "Renseignez l'email du client"}>
            <span className="material-symbols-outlined text-[18px]">mail</span> Email
          </button>
        </form>
        <form action={setInvoiceStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={inv.id} />
          <select name="status" defaultValue={inv.status} className="input py-2 w-auto">
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button className="btn-outline py-2">OK</button>
        </form>
        <form action={deleteInvoice}>
          <input type="hidden" name="id" value={inv.id} />
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-error hover:bg-error-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </form>
      </div>

      <DocumentView doc={inv} kind="FACTURE" paid={paid} settings={settings} />

      {/* Payments (not printed) */}
      <div className="print:hidden card p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline-md text-headline-md text-primary">Paiements</h3>
          <div className="text-right">
            <div className="font-body-sm text-body-sm text-on-surface-variant">Reste à payer</div>
            <div className={`font-headline-md text-headline-md ${balance > 0.5 ? "text-error" : "text-secondary"}`}>{formatFCFA(balance)}</div>
          </div>
        </div>

        {inv.payments.length > 0 && (
          <ul className="divide-y divide-outline-variant mb-5">
            {inv.payments.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <span className="material-symbols-outlined text-secondary">payments</span>
                <div className="flex-1">
                  <div className="font-label-md text-label-md text-primary">{formatFCFA(p.amount)}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{p.method} · {formatDate(p.date)}{p.note ? ` · ${p.note}` : ""}</div>
                </div>
                <form action={deletePayment}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="invoiceId" value={inv.id} />
                  <button className="text-error grid place-items-center" aria-label="Supprimer le paiement">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addPayment} className="grid sm:grid-cols-4 gap-3 items-end">
          <input type="hidden" name="invoiceId" value={inv.id} />
          <div>
            <label className="label">Montant (FCFA)</label>
            <input name="amount" type="number" min="0" step="1" required className="input" defaultValue={balance > 0.5 ? Math.round(balance) : ""} />
          </div>
          <div>
            <label className="label">Méthode</label>
            <select name="method" className="input">
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input name="date" type="date" defaultValue={today} className="input" />
          </div>
          <button className="btn-primary">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
