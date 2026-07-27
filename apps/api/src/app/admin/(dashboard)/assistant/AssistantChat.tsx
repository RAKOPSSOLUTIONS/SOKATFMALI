"use client";

import { useEffect, useRef, useState } from "react";

type Artifact = { kind: "pdf" | "excel"; label: string; url?: string; dataUri?: string };
type Msg = { role: "user" | "assistant"; content: string; artifacts?: Artifact[] };

const SUGGESTIONS = [
  "Quel est le chiffre d'affaires facturé et les impayés ?",
  "Liste les 5 dernières factures.",
  "Génère un rapport Excel des factures.",
  "Crée un devis pour Aminata Diarra : 10 sacs de ciment à 6 000 FCFA.",
  "Qui est le PDG dans l'organigramme ?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setError("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/admin/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, artifacts: data.artifacts }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-4xl">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><span className="material-symbols-outlined">smart_toy</span></span>
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Assistant IA</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Interrogez et gérez vos données, générez devis, factures et rapports.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="text-left px-3 py-2 rounded-lg bg-surface-container-high hover:bg-primary/10 font-body-sm text-body-sm text-on-surface transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-primary text-on-primary" : "card"}`}>
              <p className={`font-body-md text-body-md whitespace-pre-wrap ${m.role === "user" ? "" : "text-on-surface"}`}>{m.content}</p>
              {m.artifacts && m.artifacts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.artifacts.map((a, j) =>
                    a.kind === "excel" && a.dataUri ? (
                      <a key={j} href={a.dataUri} download={a.url || "rapport.xlsx"} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:opacity-90">
                        <span className="material-symbols-outlined text-[18px]">table_view</span> {a.label}
                      </a>
                    ) : a.url ? (
                      <a key={j} href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md bg-error-container/60 text-error hover:bg-error-container">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> {a.label}
                      </a>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="card px-4 py-3 flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span className="font-body-sm text-body-sm">L'assistant réfléchit…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="badge bg-error-container text-on-error-container mb-2 w-full justify-center py-2">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 pt-2 border-t border-outline-variant">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          placeholder="Écrivez votre demande… (Entrée pour envoyer)"
          className="input flex-1 resize-none max-h-40"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary shrink-0">
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
