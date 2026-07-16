"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/adminNav";

export function MobileNav({
  items,
  userName,
  roleLabel,
  logoutAction,
}: {
  items: NavItem[];
  userName: string;
  roleLabel: string;
  logoutAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="h-10 w-10 grid place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-surface-container-lowest shadow-2xl flex flex-col p-4 animate-[slideIn_.2s_ease-out]">
            <div className="flex items-center justify-between px-2 py-3 mb-2">
              <img src="/brand/sokatf-black.png" alt="SOKATF SARL" width="687" height="89" className="h-7 w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="h-9 w-9 grid place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto">
              {items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors ${
                      active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-outline-variant">
              <p className="font-label-md text-label-md text-primary px-4 truncate">{userName}</p>
              <p className="font-label-sm text-label-sm text-secondary px-4 mb-2">{roleLabel}</p>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
