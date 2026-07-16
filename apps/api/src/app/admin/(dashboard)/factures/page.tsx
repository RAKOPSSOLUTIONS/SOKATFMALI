import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, INVOICE_STATUSES } from "@/lib/finance";
import { deleteInvoice, deleteInvoicesBulk } from "../../finance-actions";
import { DocumentsList, type DocRow } from "../../_components/DocumentsList";

export const dynamic = "force-dynamic";

export default async function FacturesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { payments: true },
  });

  const rows: DocRow[] = invoices.map((inv) => {
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return {
      id: inv.id,
      number: inv.number,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      dateLabel: formatDate(inv.date),
      status: inv.status,
      total,
      paid,
      balance: total - paid,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Factures</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {invoices.length} facture{invoices.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/admin/factures/new" className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add</span> Nouvelle facture
        </Link>
      </div>

      <DocumentsList kind="facture" rows={rows} statuses={[...INVOICE_STATUSES]} deleteAction={deleteInvoice} bulkDeleteAction={deleteInvoicesBulk} />
    </div>
  );
}
