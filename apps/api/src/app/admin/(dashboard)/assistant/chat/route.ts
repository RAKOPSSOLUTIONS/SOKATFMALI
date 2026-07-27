import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { AI_ENABLED, runAssistant, type ChatMessage } from "@/lib/ai/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Admin-only: the assistant has full CRUD + DB access.
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }
  if (!AI_ENABLED) {
    return Response.json({ error: "Assistant non configuré : renseignez OPENAI_API_KEY dans apps/api/.env." }, { status: 503 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = raw
    .filter((m): m is ChatMessage => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20); // cap history
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Message manquant." }, { status: 400 });
  }

  try {
    const { reply, artifacts } = await runAssistant(messages, { email: session.email, name: session.name });
    await logActivity({ action: "UPDATE", entity: "Settings", detail: "[Assistant] Conversation IA", actorEmail: session.email, actorName: session.name });
    return Response.json({ reply, artifacts });
  } catch (err) {
    console.error("[assistant] error:", err);
    return Response.json({ error: "L'assistant a rencontré une erreur. Réessayez." }, { status: 500 });
  }
}
