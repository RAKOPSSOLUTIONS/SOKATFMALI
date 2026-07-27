"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AssistantChat } from "../assistant/AssistantChat";

/** Floating chatbot widget: a launcher button that opens a chat panel in place
 *  (no navigation). The panel is kept mounted after first open so the
 *  conversation persists while the user browses. */
export function AssistantFab() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // On the full-page assistant, the widget is redundant.
  if (pathname.startsWith("/admin/assistant")) return null;

  const toggle = () => {
    setOpen((o) => {
      if (!o) setMounted(true);
      return !o;
    });
  };

  return (
    <>
      {mounted && (
        <div
          className={`print:hidden fixed z-[60] bottom-24 right-4 sm:right-6 w-[min(94vw,420px)] h-[min(78vh,620px)] max-h-[620px] card shadow-2xl flex flex-col overflow-hidden ${open ? "animate-[fadeIn_.15s_ease-out]" : "hidden"}`}
          role="dialog"
          aria-label="Assistant IA"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-lowest shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary"><span className="material-symbols-outlined text-[20px]">smart_toy</span></span>
              <span className="font-label-lg text-label-lg font-bold text-primary">Assistant IA</span>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/admin/assistant" title="Ouvrir en plein écran" className="h-9 w-9 grid place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[20px]">open_in_full</span>
              </Link>
              <button type="button" onClick={() => setOpen(false)} title="Fermer" aria-label="Fermer" className="h-9 w-9 grid place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-3">
            <AssistantChat compact />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant IA"}
        title="Assistant IA"
        className="print:hidden fixed bottom-6 right-4 sm:right-6 z-[60] h-14 w-14 rounded-full bg-primary text-on-primary shadow-2xl grid place-items-center hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[26px]">{open ? "close" : "smart_toy"}</span>
      </button>
    </>
  );
}
