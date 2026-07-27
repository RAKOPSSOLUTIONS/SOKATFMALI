import { AI_ENABLED } from "@/lib/ai/agent";
import { AssistantChat } from "./AssistantChat";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Assistant IA</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Assistant intelligent avec accès aux données, à la génération de devis/factures (PDF) et aux rapports Excel.
        </p>
      </div>

      {AI_ENABLED ? (
        <AssistantChat />
      ) : (
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-error">key_off</span>
            <div className="font-body-md text-body-md text-on-surface-variant">
              <p className="font-label-md text-label-md text-primary mb-1">Assistant non configuré</p>
              <p>Ajoutez votre clé API OpenAI pour activer l'assistant :</p>
              <pre className="mt-2 p-3 rounded-lg bg-surface-container-high overflow-x-auto text-[12px]">{`# apps/api/.env
OPENAI_API_KEY="sk-…"
# optionnel : autre modèle
# OPENAI_MODEL="gpt-4o"`}</pre>
              <p className="mt-2">Puis redémarrez le serveur / rechargez pm2.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
