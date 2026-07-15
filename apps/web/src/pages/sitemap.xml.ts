import type { APIRoute } from "astro";

const pages = [
  "",
  "commerce-general",
  "services",
  "projets",
  "partenaires",
  "a-propos",
  "contact",
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://sokatf.com")).href.replace(/\/$/, "");
  const urls = pages
    .map((p) => `  <url><loc>${base}/${p}</loc></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
