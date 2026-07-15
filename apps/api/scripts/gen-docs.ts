/**
 * Generates all organisation documents as .pdf and .docx into /documents.
 * Run:  cd apps/api && DATABASE_URL="file:./dev.db" tsx scripts/gen-docs.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { DOCS } from "../src/lib/orgDocs";
import { renderOrgPDF } from "../src/lib/docPdf";
import { renderDocx } from "../src/lib/docx";

async function main() {
  const outDir = resolve(process.cwd(), "../../documents");
  mkdirSync(outDir, { recursive: true });
  for (const d of DOCS) {
    writeFileSync(resolve(outDir, `${d.slug}-sokatf.pdf`), await renderOrgPDF(d));
    writeFileSync(resolve(outDir, `${d.slug}-sokatf.docx`), await renderDocx(d));
    console.log("✓", d.slug);
  }
  console.log(`\n${DOCS.length} documents (PDF + Word) → ${outDir}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
