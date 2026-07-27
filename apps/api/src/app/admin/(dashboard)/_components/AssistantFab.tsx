"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Floating "chatbot" launcher, pinned bottom-right on every admin page. */
export function AssistantFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin/assistant")) return null; // already there
  return (
    <Link
      href="/admin/assistant"
      aria-label="Ouvrir l'assistant IA"
      title="Assistant IA"
      className="print:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-on-primary shadow-2xl grid place-items-center hover:scale-105 active:scale-95 transition-transform"
    >
      <span className="material-symbols-outlined text-[26px]">smart_toy</span>
    </Link>
  );
}
