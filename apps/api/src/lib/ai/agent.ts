import Anthropic from "@anthropic-ai/sdk";
import { COMPANY } from "@/lib/finance";
import { buildTools, type Artifact, type ToolCtx } from "./tools";

/** The assistant is only usable once an API key is configured. */
export const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const EFFORT = (process.env.ANTHROPIC_EFFORT || "medium") as "low" | "medium" | "high" | "xhigh" | "max";

const SYSTEM = `Tu es l'assistant IA du back-office de ${COMPANY.name} (${COMPANY.tagline}), à ${COMPANY.address}.
Tu aides l'équipe à consulter et gérer les données de l'entreprise et à produire des documents.

RÈGLES
- Réponds toujours en français, de façon concise et professionnelle. Les montants sont en FCFA.
- Fonde TOUTES tes réponses factuelles sur les outils. Ne devine jamais un chiffre, un statut, un numéro ou un enregistrement : appelle l'outil approprié (get_stats, list_records, get_record).
- Pour toute question sur l'organisation, les procédures ou les politiques internes, utilise search_documentation.
- Tu peux créer, modifier et supprimer des données (clients, catalogue, devis, factures, paiements). Avant toute SUPPRESSION ou action destructrice, demande une confirmation explicite à l'utilisateur, puis exécute.
- Pour créer un devis/une facture, utilise create_quote/create_invoice avec des lignes {description, quantity, unitPrice} ; le PDF est préparé automatiquement (un bouton de téléchargement apparaît). Ne colle pas le PDF dans le texte.
- Pour un rapport Excel, utilise generate_excel_report (un bouton de téléchargement apparaît). N'énumère pas des centaines de lignes dans le texte.
- Quand tu as assez d'informations pour agir, agis. Ne redemande pas ce que l'utilisateur a déjà fourni. Ne fais que ce qui est demandé, au périmètre demandé.
- Tu opères uniquement sur les données de ${COMPANY.name}.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Run one assistant turn over the conversation history, executing tools. */
export async function runAssistant(
  history: ChatMessage[],
  actor?: { email?: string; name?: string },
): Promise<{ reply: string; artifacts: Artifact[] }> {
  const client = new Anthropic(); // resolves ANTHROPIC_API_KEY from env
  const ctx: ToolCtx = { artifacts: [], actorEmail: actor?.email, actorName: actor?.name };
  const tools = buildTools(ctx);

  const finalMessage = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 12000,
    output_config: { effort: EFFORT },
    system: SYSTEM,
    tools,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    max_iterations: 16,
  });

  const reply = (finalMessage.content ?? [])
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return { reply: reply || "(aucune réponse)", artifacts: ctx.artifacts };
}
