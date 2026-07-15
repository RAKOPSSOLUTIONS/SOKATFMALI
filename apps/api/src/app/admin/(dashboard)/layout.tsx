import { Sidebar } from "./_components/Sidebar";
import { logoutAction } from "../actions";
import { getSession } from "@/lib/session";
import { canAccess, ROLE_LABEL } from "@/lib/auth";
import { ADMIN_NAV } from "@/lib/adminNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates this, but read the session for display + nav filtering.
  const session = await getSession();
  const role = session?.role ?? "commercial";
  const items = ADMIN_NAV.filter((i) => canAccess(role, i.href));

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="print:hidden hidden md:flex w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest p-4">
        <div className="px-2 py-4 mb-4">
          <img src="/brand/sokatf-black.png" alt="SOKATF SARL" width="687" height="89" className="h-8 w-auto" />
        </div>
        <Sidebar items={items} />
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <p className="font-label-md text-label-md text-primary px-4 truncate">{session?.name || session?.email}</p>
          <p className="font-label-sm text-label-sm text-secondary px-4 mb-2">{ROLE_LABEL[role] ?? role}</p>
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
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="print:hidden md:hidden flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile h-16">
          <img src="/brand/sokatf-black.png" alt="SOKATF SARL" width="687" height="89" className="h-7 w-auto" />
          <form action={logoutAction}>
            <button type="submit" className="material-symbols-outlined text-on-surface-variant">
              logout
            </button>
          </form>
        </header>
        <main className="p-margin-mobile md:p-margin-desktop w-full print:p-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
