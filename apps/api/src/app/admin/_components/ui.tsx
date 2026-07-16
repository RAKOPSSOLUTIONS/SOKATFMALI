"use client";

import { type ChangeEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "./toast";

/* ── Image field: upload (client-side resize → data URI) or paste URL ─────── *
 * Stored directly in the DB via a hidden input — no upload folder / nginx.   */
export function ImageField({ name, defaultValue = "", label = "Image", max = 640 }: { name: string; defaultValue?: string; label?: string; max?: number }) {
  const [image, setImage] = useState(defaultValue);
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * scale);
      const h = Math.round(bmp.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
      setImage(canvas.toDataURL("image/jpeg", 0.82));
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImage(String(reader.result));
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={image} />
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 rounded-lg bg-surface-container-high grid place-items-center overflow-hidden border border-outline-variant">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setImage("")} className="absolute top-1 right-1 h-6 w-6 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Retirer l'image">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </>
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[28px]">image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="btn-outline py-2 cursor-pointer inline-flex">
            <span className="material-symbols-outlined text-[18px]">upload</span> Téléverser
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <input type="url" value={image.startsWith("data:") ? "" : image} onChange={(e) => setImage(e.target.value)} className="input" placeholder="…ou coller une URL d'image" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">JPG / PNG — redimensionné automatiquement.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Low-level controlled dialog ─────────────────────────────────────────── */
export function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} my-4 bg-surface rounded-2xl shadow-2xl border border-outline-variant animate-[fadeIn_.15s_ease-out]`}>
        <div className="flex items-center justify-between gap-4 p-5 border-b border-outline-variant sticky top-0 bg-surface rounded-t-2xl">
          <h3 className="font-headline-md text-headline-md text-primary truncate">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="h-9 w-9 grid place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Add / edit modal with a trigger button ──────────────────────────────── */
export function Modal({
  title,
  triggerLabel,
  triggerIcon = "add",
  triggerClass = "btn-primary",
  size = "md",
  children,
}: {
  title: string;
  triggerLabel: string;
  triggerIcon?: string;
  triggerClass?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {triggerIcon && <span className="material-symbols-outlined text-[18px]">{triggerIcon}</span>} {triggerLabel}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size={size}>
        {children(() => setOpen(false))}
      </Dialog>
    </>
  );
}

/* ── Delete button with confirmation modal ───────────────────────────────── *
 * Renders a button that, when clicked, opens a confirm dialog. On confirm it
 * submits the nearest parent <form> (which carries the server action).       */
export function ConfirmSubmit({
  label = "Supprimer",
  icon = "delete",
  title = "Confirmer la suppression",
  message = "Cette action est irréversible. Voulez-vous continuer ?",
  className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors",
}: {
  label?: string;
  icon?: string;
  title?: string;
  message?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)} className={className}>
        {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>} {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size="sm">
        <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={() => setOpen(false)} className="btn-outline">Annuler</button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              ref.current?.closest("form")?.requestSubmit();
              toast("Supprimé", "success");
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-label-md text-label-md bg-error text-on-error hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span> Supprimer
          </button>
        </div>
      </Dialog>
    </>
  );
}

/* ── Real .xlsx export button ─────────────────────────────────────────────── *
 * POSTs the currently-displayed rows to /admin/xlsx which returns a styled
 * workbook (navy header, frozen row, autofilter, number formats).            */
export function ExportButton({
  filename,
  headers,
  rows,
  sheet,
  label = "Excel",
  className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-secondary bg-secondary-container/50 hover:bg-secondary-container transition-colors disabled:opacity-50",
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  sheet?: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (busy) return;
    if (rows.length === 0) {
      toast("Rien à exporter.", "info");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/admin/xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, sheet: sheet ?? label, columns: headers, rows }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast(`Export Excel (${rows.length} ligne${rows.length > 1 ? "s" : ""})`, "success");
    } catch {
      toast("Export échoué.", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" onClick={download} disabled={busy} className={className}>
      <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "table_view"}</span> {label}
    </button>
  );
}

/* ── View a PDF (devis / facture / doc) inside a modal ───────────────────── */
export function PdfModal({
  url,
  label = "Aperçu",
  icon = "visibility",
  triggerClass = "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors",
  title = "Aperçu du document",
}: {
  url: string;
  label?: string;
  icon?: string;
  triggerClass?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>} {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size="xl">
        <div className="flex justify-end mb-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline py-2">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span> Ouvrir / télécharger
          </a>
        </div>
        <iframe src={url} title={title} className="w-full h-[70vh] rounded-lg border border-outline-variant bg-white" />
      </Dialog>
    </>
  );
}
