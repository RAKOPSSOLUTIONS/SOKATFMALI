import * as React from "react";
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { COMPANY } from "./finance";
import { logoDataUri, logoAspect } from "./brand";
import type { OrgDoc, Block } from "./orgDocs";

const LOGO_W = 150; // header logo width (pt)

const NAVY = "#0f172a";
const GOLD = "#b8860b";
const INK = "#334155";
const GREY = "#64748b";
const LINE = "#e2e8f0";
const SOFT = "#f8fafc";

const s = StyleSheet.create({
  // NOTE: no global lineHeight — a page-level unitless lineHeight makes
  // @react-pdf under-compute the tall title's box, so the subtitle overlapped it.
  page: { paddingTop: 44, paddingHorizontal: 44, paddingBottom: 58, fontSize: 10.5, color: INK, fontFamily: "Helvetica" },

  // Header
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headMeta: { textAlign: "right", fontSize: 8, color: GREY, lineHeight: 1.5 },
  headRule: { height: 2, backgroundColor: NAVY, marginTop: 10 },

  // Title block
  title: { fontSize: 21, fontFamily: "Helvetica-Bold", color: NAVY, lineHeight: 1.2, marginTop: 20 },
  subtitle: { fontSize: 11, color: GOLD, lineHeight: 1.3, marginTop: 6 },
  titleAccent: { width: 46, height: 3, backgroundColor: GOLD, marginTop: 10, marginBottom: 18 },

  // Section heading with gold bar
  h2Row: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 7 },
  h2Bar: { width: 4, height: 13, backgroundColor: GOLD, marginRight: 8, borderRadius: 2 },
  h2: { fontSize: 12.5, fontFamily: "Helvetica-Bold", color: NAVY },

  p: { marginBottom: 7, lineHeight: 1.55 },
  li: { flexDirection: "row", marginBottom: 4 },
  liBullet: { color: GOLD, width: 14, fontFamily: "Helvetica-Bold" },
  liText: { flex: 1, lineHeight: 1.45 },

  // Table
  th: { backgroundColor: NAVY, padding: 6, fontSize: 8.5, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  td: { padding: 6, borderBottomWidth: 1, borderBottomColor: LINE, fontSize: 9.5, lineHeight: 1.4 },

  // Org chart
  orgBox: { borderWidth: 1, borderColor: LINE, borderLeftWidth: 4, borderLeftColor: GOLD, borderRadius: 4, backgroundColor: SOFT, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 2 },
  orgRole: { fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 11 },
  orgName: { color: GOLD, fontSize: 10, marginTop: 2 },
  orgArrow: { textAlign: "center", color: "#cbd5e1", fontSize: 9, marginVertical: 2 },

  footer: { position: "absolute", bottom: 28, left: 44, right: 44, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: GREY },
});

function renderBlock(b: Block, i: number) {
  if (b.type === "h2")
    return (
      <View key={i} style={s.h2Row} wrap={false}>
        <View style={s.h2Bar} />
        <Text style={s.h2}>{b.text}</Text>
      </View>
    );
  if (b.type === "p") return <Text key={i} style={s.p}>{b.text}</Text>;
  if (b.type === "ul")
    return (
      <View key={i} style={{ marginBottom: 8 }}>
        {b.items.map((it, j) => (
          <View key={j} style={s.li}>
            <Text style={s.liBullet}>•</Text>
            <Text style={s.liText}>{it}</Text>
          </View>
        ))}
      </View>
    );
  if (b.type === "ol")
    return (
      <View key={i} style={{ marginBottom: 8 }}>
        {b.items.map((it, j) => (
          <View key={j} style={s.li}>
            <Text style={s.liBullet}>{j + 1}.</Text>
            <Text style={s.liText}>{it}</Text>
          </View>
        ))}
      </View>
    );
  if (b.type === "table")
    return (
      <View key={i} style={{ marginVertical: 10, borderWidth: 1, borderColor: LINE, borderRadius: 4, overflow: "hidden" }}>
        <View style={{ flexDirection: "row" }}>{b.head.map((h, j) => <Text key={j} style={[s.th, { flex: 1 }]}>{h}</Text>)}</View>
        {b.rows.map((r, j) => (
          <View key={j} style={{ flexDirection: "row", backgroundColor: j % 2 ? SOFT : "#ffffff" }} wrap={false}>
            {r.map((c, k) => <Text key={k} style={[s.td, { flex: 1 }]}>{c}</Text>)}
          </View>
        ))}
      </View>
    );
  if (b.type === "org")
    return (
      <View key={i} style={{ marginVertical: 10 }}>
        {b.levels.map((lvl, j) => (
          <View key={j} wrap={false}>
            <View style={s.orgBox}>
              <Text style={s.orgRole}>{lvl.role}</Text>
              <Text style={s.orgName}>{lvl.name}</Text>
            </View>
            {j < b.levels.length - 1 ? <Text style={s.orgArrow}>▼</Text> : null}
          </View>
        ))}
      </View>
    );
  return null;
}

function DocPage({ doc }: { doc: OrgDoc }) {
  return (
    <Document title={doc.title} author={COMPANY.name}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headRow} fixed>
          <Image src={logoDataUri("colors")} style={{ width: LOGO_W, height: LOGO_W / logoAspect("colors") }} />
          <View style={s.headMeta}>
            <Text>{COMPANY.tagline}</Text>
            <Text>NIF {COMPANY.nif} · RCCM {COMPANY.rccm}</Text>
          </View>
        </View>
        <View style={s.headRule} fixed />

        {/* Title */}
        <Text style={s.title}>{doc.title}</Text>
        {doc.subtitle ? <Text style={s.subtitle}>{doc.subtitle}</Text> : null}
        <View style={s.titleAccent} />

        {/* Body */}
        {doc.blocks.map((b, i) => renderBlock(b, i))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>{COMPANY.name} — {COMPANY.address}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrgPDF(doc: OrgDoc): Promise<Buffer> {
  return renderToBuffer(<DocPage doc={doc} />);
}
