import { cookies } from "next/headers";
import { Sidebar } from "./_components/Sidebar";
import { logoutAction } from "../actions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates this, but read the session for display.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="h-9 w-9 rounded-lg bg-primary grid place-items-center">
            <span className="material-symbols-outlined text-on-primary text-[20px]">
              corporate_fare
            </span>
          </div>
          <div className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
            SOKATF
          </div>
        </div>
        <Sidebar />
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant px-4 mb-2 truncate">
            {session?.email}
          </p>
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
        <header className="md:hidden flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile h-16">
          <div className="font-headline-md text-headline-md font-bold text-primary">
            SOKATF
          </div>
          <form action={logoutAction}>
            <button type="submit" className="material-symbols-outlined text-on-surface-variant">
              logout
            </button>
          </form>
        </header>
        <main className="p-margin-mobile md:p-margin-desktop max-w-container-max">
          {children}
        </main>
      </div>
    </div>
  );
}
