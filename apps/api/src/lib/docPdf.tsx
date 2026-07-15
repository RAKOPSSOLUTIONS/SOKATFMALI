import * as React from "react";
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { COMPANY } from "./finance";
import type { OrgDoc, Block } from "./orgDocs";

const NAVY = "#0f172a";
const GOLD = "#b8860b";
const GREY = "#64748b";
const LINE = "#e2e8f0";

const s = StyleSheet.create({
  page: { padding: 44, fontSize: 11, color: "#1e293b", fontFamily: "Helvetica", lineHeight: 1.4 },
  brand: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY },
  tagline: { fontSize: 9, color: GREY, marginBottom: 14 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 6 },
  subtitle: { fontSize: 11, color: GOLD, marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 12, marginBottom: 4 },
  p: { marginBottom: 6 },
  li: { marginBottom: 3, paddingLeft: 10 },
  th: { backgroundColor: "#f1f5f9", padding: 5, fontSize: 9, color: GREY, fontFamily: "Helvetica-Bold" },
  td: { padding: 5, borderBottomWidth: 1, borderBottomColor: LINE, fontSize: 10 },
  orgBox: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, padding: 8, marginBottom: 4, alignItems: "center" },
  footer: { position: "absolute", bottom: 30, left: 44, right: 44, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6, fontSize: 8, color: GREY, textAlign: "center" },
});

function renderBlock(b: Block, i: number) {
  if (b.type === "h2") return <Text key={i} style={s.h2}>{b.text}</Text>;
  if (b.type === "p") return <Text key={i} style={s.p}>{b.text}</Text>;
  if (b.type === "ul") return <View key={i} style={{ marginBottom: 6 }}>{b.items.map((it, j) => <Text key={j} style={s.li}>•  {it}</Text>)}</View>;
  if (b.type === "ol") return <View key={i} style={{ marginBottom: 6 }}>{b.items.map((it, j) => <Text key={j} style={s.li}>{j + 1}.  {it}</Text>)}</View>;
  if (b.type === "table")
    return (
      <View key={i} style={{ marginVertical: 8 }}>
        <View style={{ flexDirection: "row" }}>{b.head.map((h, j) => <Text key={j} style={[s.th, { flex: 1 }]}>{h}</Text>)}</View>
        {b.rows.map((r, j) => (
          <View key={j} style={{ flexDirection: "row" }}>{r.map((c, k) => <Text key={k} style={[s.td, { flex: 1 }]}>{c}</Text>)}</View>
        ))}
      </View>
    );
  if (b.type === "org")
    return (
      <View key={i} style={{ marginVertical: 8 }}>
        {b.levels.map((lvl, j) => (
          <View key={j}>
            <View style={s.orgBox}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: NAVY }}>{lvl.role}</Text>
              <Text style={{ color: GOLD }}>{lvl.name}</Text>
            </View>
            {j < b.levels.length - 1 ? <Text style={{ textAlign: "center", color: GREY, marginBottom: 4 }}>▼</Text> : null}
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
        <Text style={s.brand}>{COMPANY.name}</Text>
        <Text style={s.tagline}>{COMPANY.tagline}</Text>
        <Text style={s.title}>{doc.title}</Text>
        {doc.subtitle ? <Text style={s.subtitle}>{doc.subtitle}</Text> : null}
        {doc.blocks.map((b, i) => renderBlock(b, i))}
        <Text style={s.footer} fixed>
          {COMPANY.name} — NIF : {COMPANY.nif} · RCCM : {COMPANY.rccm} · {COMPANY.address}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderOrgPDF(doc: OrgDoc): Promise<Buffer> {
  return renderToBuffer(<DocPage doc={doc} />);
}
