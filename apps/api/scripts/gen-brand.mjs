/**
 * Regenerates src/lib/brand.ts by embedding public/brand/*.png as base64.
 * Run from apps/api:  node scripts/gen-brand.mjs
 *
 * We embed the logos (rather than reading them from disk at runtime) so PDF /
 * Word generation behaves identically in the tsx scripts, Next dev, and the
 * bundled production server — no cwd or filesystem assumptions.
 */
import fs from "fs";
import path from "path";

const root = process.argv[2] || process.cwd();
const dir = path.join(root, "public/brand");
const meta = {
  colors: { file: "sokatf-colors.png", width: 692, height: 93 },
  white: { file: "sokatf-white.png", width: 683, height: 92 },
  black: { file: "sokatf-black.png", width: 687, height: 89 },
};

const lines = [];
lines.push("// AUTO-GENERATED brand assets — SOKATF SARL logos embedded as base64 PNG.");
lines.push("// Regenerate with: node scripts/gen-brand.mjs (reads public/brand/*.png).");
lines.push("// Embedded (not read from disk) so PDF/Word generation works identically in");
lines.push("// the tsx seed/gen scripts, Next dev, and the bundled production server — no");
lines.push("// cwd/filesystem assumptions. Node-only (Buffer); never import from edge.");
lines.push("");
lines.push("type LogoMeta = { b64: string; width: number; height: number };");
lines.push("");
lines.push('export const LOGOS: Record<"colors" | "white" | "black", LogoMeta> = {');
for (const [k, m] of Object.entries(meta)) {
  const b64 = fs.readFileSync(path.join(dir, m.file)).toString("base64");
  lines.push(`  ${k}: { width: ${m.width}, height: ${m.height}, b64: "${b64}" },`);
}
lines.push("};");
lines.push("");
lines.push("export type LogoVariant = keyof typeof LOGOS;");
lines.push("");
lines.push("/** data: URI — for @react-pdf <Image src> and HTML <img src>. */");
lines.push('export const logoDataUri = (v: LogoVariant = "colors") =>');
lines.push("  `data:image/png;base64,${LOGOS[v].b64}`;");
lines.push("");
lines.push("/** Raw PNG Buffer — for docx ImageRun. */");
lines.push('export const logoBuffer = (v: LogoVariant = "colors") =>');
lines.push('  Buffer.from(LOGOS[v].b64, "base64");');
lines.push("");
lines.push("/** width / height, to preserve aspect ratio from a single dimension. */");
lines.push('export const logoAspect = (v: LogoVariant = "colors") =>');
lines.push("  LOGOS[v].width / LOGOS[v].height;");
lines.push("");

const outPath = path.join(root, "src/lib/brand.ts");
fs.writeFileSync(outPath, lines.join("\n"));
console.log("wrote", path.relative(root, outPath), "(" + Math.round(fs.statSync(outPath).size / 1024) + " KB)");
