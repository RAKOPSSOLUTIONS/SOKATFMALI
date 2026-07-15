"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/adminNav";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
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
  );
}
