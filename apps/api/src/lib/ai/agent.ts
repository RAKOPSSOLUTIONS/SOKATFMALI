import OpenAI from "openai";
import { COMPANY } from "@/lib/finance";
import { ROLE_LABEL } from "@/lib/auth";
import { buildTools, type Artifact, type ToolCtx } from "./tools";

/** The assistant is only usable once an API key is configured. */
export const AI_ENABLED = Boolean(process.env.OPENAI_API_KEY);

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

const SYSTEM = `Tu es l'assistant IA du back-office de ${COMPANY.name} (${COMPANY.tagline}), à ${COMPANY.address}.
Tu aides l'équipe à consulter et gérer les données de l'entreprise et à produire des documents.

RÈGLES
- Réponds toujours en français, de façon concise et professionnelle. Les montants sont en FCFA.
- Fonde TOUTES tes réponses factuelles sur les outils. Ne devine jamais un chiffre, un statut, un numéro ou un enregistrement : appelle l'outil approprié (get_stats, list_records, get_record).
- Pour toute question sur l'organisation, les procédures ou les politiques internes, utilise search_documentation.
- Tu peux créer, modifier et supprimer des données (clients, catalogue, devis, factures, paiements). Avant toute SUPPRESSION ou action destructrice, demande une confirmation explicite à l'utilisateur, puis exécute.
- Pour créer un devis/une facture, utilise create_quote/create_invoice avec des lignes {description, quantity, unitPrice} ; le PDF est préparé automatiquement (un bouton de téléchargement apparaît). Ne colle pas le PDF dans le texte.
- Pour un rapport Excel, utilise generate_excel_report (un bouton de téléchargement apparaît). N'énumère pas des centaines de lignes dans le texte.
- Quand tu as assez d'informations pour agir, agis. Ne redemande pas ce que l'utilisateur a déjà fourni. Ne fais que ce qui est demandé.
- Tu opères uniquement sur les données de ${COMPANY.name}.
- Tes outils sont limités aux droits du rôle de l'utilisateur. Si une demande dépasse ses droits (un outil renvoie « non autorisé »), explique poliment que son rôle ne le permet pas et propose de voir avec un administrateur — n'invente pas de contournement.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Run one assistant turn over the conversation history, executing tools. */
export async function runAssistant(
  history: ChatMessage[],
  actor?: { email?: string; name?: string; role?: string },
): Promise<{ reply: string; artifacts: Artifact[] }> {
  const client = new OpenAI(); // resolves OPENAI_API_KEY from env
  const role = actor?.role || "commercial";
  const ctx: ToolCtx = { artifacts: [], actorEmail: actor?.email, actorName: actor?.name, role };
  const tools = buildTools(ctx);
  const handlers = new Map(tools.map((t) => [t.spec.function.name, t.run]));
  const toolSpecs = tools.map((t) => t.spec);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: `${SYSTEM}\n\nRôle de l'utilisateur actuel : ${ROLE_LABEL[role] ?? role}.` },
    ...history.map((m) => ({ role: m.role, content: m.content }) as const),
  ];

  let reply = "";
  for (let i = 0; i < 16; i++) {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolSpecs,
      tool_choice: "auto",
    });
    const msg = res.choices[0]?.message;
    if (!msg) break;
    const calls = msg.tool_calls ?? [];

    // Preserve the assistant turn (with any tool calls) in history.
    messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });

    if (calls.length === 0) {
      reply = msg.content ?? "";
      break;
    }

    for (const call of calls) {
      if (call.type !== "function") continue;
      const handler = handlers.get(call.function.name);
      let out: string;
      try {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        out = handler ? await handler(args) : JSON.stringify({ error: "Outil inconnu." });
      } catch (err) {
        out = JSON.stringify({ error: err instanceof Error ? err.message : "Échec de l'outil." });
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: out });
    }
  }

  return { reply: reply.trim() || "(aucune réponse)", artifacts: ctx.artifacts };
}
