import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QUOTE_STATUSES, STATUS_LABEL, parseItems, computeTotals, waLink, docSummary } from "@/lib/finance";
import { DocumentView } from "../../../_components/DocumentView";
import { PrintButton } from "../../../_components/PrintButton";
import { setQuoteStatus, deleteQuote, convertQuoteToInvoice, sendQuoteEmail } from "../../../finance-actions";

export const dynamic = "force-dynamic";

export default async function DevisViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) notFound();

  const { total } = computeTotals(parseItems(quote.items), quote.taxRate, quote.discount);

  return (
    <div className="space-y-6">
      {/* Action bar (hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center gap-3">
        <Link href="/admin/devis" className="font-label-md text-label-md text-on-surface-variant hover:text-primary mr-auto">← Devis</Link>
        <PrintButton />
        <Link href={`/admin/devis/${quote.id}/edit`} className="btn-outline py-2">
          <span className="material-symbols-outlined text-[18px]">edit</span> Modifier
        </Link>
        <form action={convertQuoteToInvoice}>
          <input type="hidden" name="id" value={quote.id} />
          <button className="btn-outline py-2">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span> Convertir en facture
          </button>
        </form>
        <a
          href={waLink(quote.clientPhone, docSummary("DEVIS", quote.number, total, quote.clientName))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline py-2"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
        </a>
        <form action={sendQuoteEmail}>
          <input type="hidden" name="id" value={quote.id} />
          <button className="btn-outline py-2 disabled:opacity-50" disabled={!quote.clientEmail} title={quote.clientEmail ? "" : "Renseignez l'email du client"}>
            <span className="material-symbols-outlined text-[18px]">mail</span> Email
          </button>
        </form>
        <form action={setQuoteStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={quote.id} />
          <select name="status" defaultValue={quote.status} className="input py-2 w-auto">
            {QUOTE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button className="btn-outline py-2">OK</button>
        </form>
        <form action={deleteQuote}>
          <input type="hidden" name="id" value={quote.id} />
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-error hover:bg-error-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </form>
      </div>

      <DocumentView doc={quote} kind="DEVIS" />
    </div>
  );
}
