"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export function LoginForm({ next, logo }: { next: string; logo: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="w-full max-w-md">
      <div className="card overflow-hidden shadow-2xl">
        {/* Brand accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#0f172a] via-[#b8860b] to-[#fed65b]" />
        <div className="p-8 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="SOKATF SARL" width="687" height="89" className="h-9 w-auto" />
          <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary mt-3 mb-8">
            Espace d'administration
          </p>

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="username" required className="input" placeholder="admin@sokatf.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="••••••••" />
            </div>

            {state.error && (
              <p className="flex items-center gap-2 badge bg-error-container text-on-error-container w-full justify-center py-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full py-3.5">
              {pending ? (
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Connexion…</span>
              ) : (
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">login</span> Se connecter</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6">
        SOKATF SARL — Commerce général multisectoriel au Mali
      </p>
    </div>
  );
}
