/**
 * Sets the payment / bank coordinates shown at the bottom of every devis & facture.
 * Idempotent — safe to run any number of times.
 *
 *   Local :  cd apps/api && DATABASE_URL="file:./dev.db"  tsx scripts/set-bank.ts
 *   VPS   :  cd /var/www/apis/sokatf/apps/api && DATABASE_URL="file:./prod.db" pnpm tsx scripts/set-bank.ts
 *
 * Override the text with the BANK_DETAILS env var if needed.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BANK_DETAILS =
  process.env.BANK_DETAILS ??
  [
    "Banque : BMS-SA",
    "N° de compte : ML102 01017 73519702001-81",
    "Mobile Money (Orange Money) : (+223) 66 77 32 75",
  ].join("\n");

async function main() {
  await prisma.setting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", bankDetails: BANK_DETAILS },
    update: { bankDetails: BANK_DETAILS },
  });
  console.log("✓ Coordonnées de paiement mises à jour :\n" + BANK_DETAILS);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
