"use client";

import { use, useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = use(searchParams);
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <main className="min-h-screen grid place-items-center px-margin-mobile bg-surface">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary grid place-items-center">
            <span className="material-symbols-outlined text-on-primary">
              shield_person
            </span>
          </div>
          <div>
            <div className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
              SOKATF-SARL
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Administration
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="next" value={sp?.next ?? "/admin"} />
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="input"
              placeholder="admin@sokatf-sarl.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="badge bg-error-container text-on-error-container w-full justify-center">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
