"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

let counter = 0;
const listeners = new Set<(t: Toast) => void>();

/** Fire a toast from anywhere in client code. */
export function toast(message: string, type: ToastType = "success") {
  counter += 1;
  const t = { id: counter, message, type };
  listeners.forEach((l) => l(t));
}

const ICON: Record<ToastType, string> = { success: "check_circle", error: "error", info: "info" };
const BORDER: Record<ToastType, string> = { success: "border-l-secondary", error: "border-l-error", info: "border-l-primary" };
const TEXT: Record<ToastType, string> = { success: "text-secondary", error: "text-error", info: "text-primary" };

/** Mount once (in the dashboard layout). Renders stacked auto-dismissing toasts. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const add = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  // Read any flash queued by a server action (survives redirects), then clear it.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const m = document.cookie.match(/(?:^|;\s*)sokatf_flash=([^;]+)/);
    if (!m) return;
    document.cookie = "sokatf_flash=; Max-Age=0; path=/";
    try {
      const { message, type } = JSON.parse(decodeURIComponent(m[1]));
      if (message) toast(message, type);
    } catch {
      /* ignore malformed flash */
    }
  }, [pathname]);

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[min(92vw,360px)] print:hidden">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant border-l-4 ${BORDER[t.type]} shadow-xl animate-[fadeIn_.15s_ease-out]`}
        >
          <span className={`material-symbols-outlined ${TEXT[t.type]}`}>{ICON[t.type]}</span>
          <span className="font-body-md text-body-md text-on-surface flex-1">{t.message}</span>
          <button type="button" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-on-surface-variant hover:text-on-surface" aria-label="Fermer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

/** Drop inside a <form> to toast on submit (for server-action forms). */
export function FormToast({ message, type = "success" }: { message: string; type?: ToastType }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const handler = () => toast(message, type);
    form.addEventListener("submit", handler);
    return () => form.removeEventListener("submit", handler);
  }, [message, type]);
  return <span ref={ref} className="hidden" aria-hidden />;
}
