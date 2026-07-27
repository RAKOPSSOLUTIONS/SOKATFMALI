"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const [ttsOk, setTtsOk] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const autoSpeakRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef(false);
  const finalRef = useRef("");

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { autoSpeakRef.current = autoSpeak; }, [autoSpeak]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTtsOk("speechSynthesis" in window);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setVoiceOk(true);
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      if (final) finalRef.current += final;
      setInput((finalRef.current + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const text = finalRef.current.trim();
      finalRef.current = "";
      if (text && !abortRef.current) void sendRef.current(text);
    };
    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch { /* ignore */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    window.speechSynthesis.speak(u);
  }, []);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || busyRef.current) return;
    setError("");
    const next: Msg[] = [...messagesRef.current, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    busyRef.current = true;
    try {
      const res = await fetch("/admin/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, artifacts: data.artifacts }]);
      if (autoSpeakRef.current && data.reply) speak(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }, [speak]);

  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; }, [send]);

  const toggleListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) { abortRef.current = true; try { rec.stop(); } catch { /* */ } setListening(false); return; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    abortRef.current = false;
    finalRef.current = "";
    setInput("");
    try { rec.start(); setListening(true); } catch { /* already started */ }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-4xl">
      {ttsOk && (
        <div className="flex items-center justify-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-on-surface-variant">
            <input type="checkbox" checked={autoSpeak} onChange={(e) => { setAutoSpeak(e.target.checked); if (!e.target.checked) window.speechSynthesis.cancel(); }} className="h-4 w-4 accent-primary" />
            <span className="material-symbols-outlined text-[18px]">{autoSpeak ? "volume_up" : "volume_off"}</span> Lecture auto des réponses
          </label>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><span className="material-symbols-outlined">smart_toy</span></span>
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Assistant IA</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Interrogez et gérez vos données, générez devis, factures et rapports.{voiceOk ? " Cliquez le micro pour parler." : ""}</p>
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
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {m.role === "assistant" && ttsOk && (
                  <button type="button" onClick={() => speak(m.content)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors" aria-label="Écouter">
                    <span className="material-symbols-outlined text-[18px]">volume_up</span> Écouter
                  </button>
                )}
                {m.artifacts?.map((a, j) =>
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
      {listening && <p className="flex items-center justify-center gap-2 mb-2 font-body-sm text-body-sm text-error"><span className="material-symbols-outlined text-[18px] animate-pulse">mic</span> Écoute en cours… parlez, puis marquez une pause.</p>}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 pt-2 border-t border-outline-variant">
        {voiceOk && (
          <button type="button" onClick={toggleListen} title="Dicter" aria-label="Dicter" className={`shrink-0 h-12 w-12 grid place-items-center rounded-lg transition-colors ${listening ? "bg-error text-on-error animate-pulse" : "border border-outline text-primary hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined">{listening ? "stop" : "mic"}</span>
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          placeholder={listening ? "Parlez…" : "Écrivez votre demande… (Entrée pour envoyer)"}
          className="input flex-1 resize-none max-h-40"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary shrink-0">
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
