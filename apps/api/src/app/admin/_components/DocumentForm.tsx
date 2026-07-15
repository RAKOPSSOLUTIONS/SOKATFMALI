"use client";

import { useState } from "react";

type Item = { description: string; quantity: number; unitPrice: number };

type DocDefaults = {
  id?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  date?: string; // yyyy-mm-dd
  secondDate?: string; // validUntil (devis) | dueDate (facture)
  items?: Item[];
  taxRate?: number;
  discount?: number;
  notes?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " FCFA";

export function DocumentForm({
  action,
  submitLabel,
  kind,
  doc,
  clients,
  catalog,
}: {
  action: (fd: FormData) => void;
  submitLabel: string;
  kind: "devis" | "facture";
  doc?: DocDefaults;
  clients?: { id: string; name: string; company: string | null; email: string | null; phone: string | null; address: string | null }[];
  catalog?: { id: string; kind: string; name: string; unit: string; price: number }[];
}) {
  const [items, setItems] = useState<Item[]>(
    doc?.items && doc.items.length ? doc.items : [{ description: "", quantity: 1, unitPrice: 0 }],
  );
  const [taxRate, setTaxRate] = useState(doc?.taxRate ?? 18);
  const [discount, setDiscount] = useState(doc?.discount ?? 0);
  const [client, setClient] = useState({
    clientName: doc?.clientName ?? "",
    clientCompany: doc?.clientCompany ?? "",
    clientEmail: doc?.clientEmail ?? "",
    clientPhone: doc?.clientPhone ?? "",
    clientAddress: doc?.clientAddress ?? "",
  });
  const setC = (patch: Partial<typeof client>) => setClient((p) => ({ ...p, ...patch }));

  const secondDateName = kind === "devis" ? "validUntil" : "dueDate";
  const secondDateLabel = kind === "devis" ? "Valable jusqu'au" : "Échéance";

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const taxable = Math.max(0, subtotal - (Number(discount) || 0));
  const tax = taxable * ((Number(taxRate) || 0) / 100);
  const total = taxable + tax;

  const update = (idx: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addRow = () => setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeRow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  // Insert a catalogue product/service as a line. If the only row is the empty
  // default, replace it so the list doesn't start with a blank line.
  const addFromCatalog = (id: string) => {
    const c = catalog?.find((x) => x.id === id);
    if (!c) return;
    const line = { description: c.name, quantity: 1, unitPrice: c.price };
    setItems((prev) => {
      const [first] = prev;
      if (prev.length === 1 && !first.description && !first.unitPrice) return [line];
      return [...prev, line];
    });
  };

  return (
    <form action={action} className="space-y-8">
      {doc?.id && <input type="hidden" name="id" value={doc.id} />}
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {/* Client */}
      <div className="card p-6">
        <h3 className="font-headline-md text-headline-md text-primary mb-5">Client</h3>
        {clients && clients.length > 0 && (
          <div className="mb-4">
            <label className="label">Client existant</label>
            <select
              className="input"
              defaultValue=""
              onChange={(e) => {
                const c = clients.find((x) => x.id === e.target.value);
                if (c)
                  setClient({
                    clientName: c.name,
                    clientCompany: c.company ?? "",
                    clientEmail: c.email ?? "",
                    clientPhone: c.phone ?? "",
                    clientAddress: c.address ?? "",
                  });
              }}
            >
              <option value="">— Choisir dans le carnet (ou saisir ci-dessous) —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nom du client *</label>
            <input name="clientName" required value={client.clientName} onChange={(e) => setC({ clientName: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Société</label>
            <input name="clientCompany" value={client.clientCompany} onChange={(e) => setC({ clientCompany: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="clientEmail" type="email" value={client.clientEmail} onChange={(e) => setC({ clientEmail: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input name="clientPhone" value={client.clientPhone} onChange={(e) => setC({ clientPhone: e.target.value })} className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Adresse</label>
            <input name="clientAddress" value={client.clientAddress} onChange={(e) => setC({ clientAddress: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Date</label>
            <input name="date" type="date" defaultValue={doc?.date} className="input" />
          </div>
          <div>
            <label className="label">{secondDateLabel}</label>
            <input name={secondDateName} type="date" defaultValue={doc?.secondDate} className="input" />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="font-headline-md text-headline-md text-primary">Lignes</h3>
          {catalog && catalog.length > 0 && (
            <select
              className="input sm:w-72"
              value=""
              onChange={(e) => {
                addFromCatalog(e.target.value);
              }}
            >
              <option value="">+ Ajouter depuis le catalogue…</option>
              <optgroup label="Produits">
                {catalog.filter((c) => c.kind === "PRODUCT").map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {fmt(c.price)}/{c.unit}</option>
                ))}
              </optgroup>
              <optgroup label="Services">
                {catalog.filter((c) => c.kind === "SERVICE").map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {fmt(c.price)}/{c.unit}</option>
                ))}
              </optgroup>
            </select>
          )}
        </div>
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant px-1">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qté</div>
            <div className="col-span-2 text-right">P.U. (FCFA)</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-center">
              <input
                className="input col-span-12 md:col-span-6"
                placeholder="Désignation…"
                value={it.description}
                onChange={(e) => update(idx, { description: e.target.value })}
              />
              <input
                className="input col-span-4 md:col-span-2 text-right"
                type="number"
                min="0"
                step="1"
                value={it.quantity}
                onChange={(e) => update(idx, { quantity: Number(e.target.value) })}
              />
              <input
                className="input col-span-5 md:col-span-2 text-right"
                type="number"
                min="0"
                step="1"
                value={it.unitPrice}
                onChange={(e) => update(idx, { unitPrice: Number(e.target.value) })}
              />
              <div className="col-span-2 md:col-span-1 text-right font-label-md text-label-md text-primary">
                {fmt((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}
              </div>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="col-span-1 text-error grid place-items-center"
                aria-label="Supprimer la ligne"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="btn-outline py-2 mt-4">
          <span className="material-symbols-outlined text-[18px]">add</span> Ajouter une ligne
        </button>
      </div>

      {/* Totals + notes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <label className="label">Notes / conditions</label>
          <textarea name="notes" rows={5} defaultValue={doc?.notes} className="input" placeholder="Conditions de paiement, délais de livraison…" />
        </div>
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="label mb-0">Remise (FCFA)</label>
            <input
              name="discount"
              type="number"
              min="0"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="input w-40 text-right"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="label mb-0">TVA (%)</label>
            <input
              name="taxRate"
              type="number"
              min="0"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="input w-40 text-right"
            />
          </div>
          <div className="border-t border-outline-variant pt-4 space-y-2 font-body-md text-body-md">
            <div className="flex justify-between"><span className="text-on-surface-variant">Sous-total</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Remise</span><span>− {fmt(Number(discount) || 0)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">TVA ({taxRate || 0}%)</span><span>{fmt(tax)}</span></div>
            <div className="flex justify-between font-headline-md text-headline-md text-primary pt-2 border-t border-outline-variant">
              <span>Total TTC</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
