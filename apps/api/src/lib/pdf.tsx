import * as React from "react";
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { COMPANY, parseItems, computeTotals, formatDate } from "./finance";
import { logoDataUri, logoAspect } from "./brand";

const LOGO_W = 150; // header logo width (pt); height derived from aspect ratio

const NAVY = "#0f172a";
const GOLD = "#b8860b";
const GREY = "#64748b";
const LINE = "#e2e8f0";

// PDF-safe money format (regular spaces — avoids narrow-nbsp glyph issues).
const money = (n: number) =>
  Math.round(n || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";

type PdfDoc = {
  number: string;
  date: Date;
  validUntil?: Date | null;
  dueDate?: Date | null;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  items: string;
  taxRate: number;
  discount: number;
  notes?: string | null;
};
type PdfSettings = { bankDetails?: string | null; paymentTerms?: string | null; documentFooter?: string | null } | null | undefined;

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingHorizontal: 40, paddingBottom: 70, fontSize: 10, color: "#1e293b", fontFamily: "Helvetica" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  headerBox: { borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 12, marginBottom: 16 },
  company: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY },
  small: { fontSize: 9, color: GREY, marginTop: 2 },
  docTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "right" },
  docNum: { fontSize: 12, color: GOLD, textAlign: "right", fontFamily: "Helvetica-Bold" },
  section: { marginTop: 10 },
  label: { fontSize: 8, color: GREY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  clientName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY },
  th: { backgroundColor: "#f1f5f9", padding: 6, fontSize: 8, color: GREY, textTransform: "uppercase" },
  td: { padding: 6, borderBottomWidth: 1, borderBottomColor: LINE, fontSize: 10 },
  totalsBox: { marginTop: 12, marginLeft: "auto", width: 230 },
  tRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { flexDirection: "row", justifyContent: "space-between", paddingTop: 4, marginTop: 4, borderTopWidth: 2, borderTopColor: NAVY },
  bold: { fontFamily: "Helvetica-Bold", color: NAVY },
  bankBox: { marginTop: 12, padding: 8, backgroundColor: "#f8fafc" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, paddingTop: 8, borderTopWidth: 1, borderTopColor: LINE, textAlign: "center", fontSize: 8, color: GREY },
});

function DocPDF({ doc, kind, settings, paid }: { doc: PdfDoc; kind: "DEVIS" | "FACTURE"; settings: PdfSettings; paid: number }) {
  const items = parseItems(doc.items);
  const { subtotal, discount, tax, total } = computeTotals(items, doc.taxRate, doc.discount);
  const balance = total - paid;
  const secondDate = kind === "DEVIS" ? doc.validUntil : doc.dueDate;
  const secondLabel = kind === "DEVIS" ? "Valable jusqu'au" : "Échéance";

  return (
    <Document title={doc.number} author={COMPANY.name}>
      <Page size="A4" style={s.page}>
        <View style={[s.between, s.headerBox]}>
          <View>
            <Image src={logoDataUri("black")} style={{ width: LOGO_W, height: LOGO_W / logoAspect("black"), marginBottom: 6 }} />
            <Text style={s.small}>{COMPANY.tagline}</Text>
            <Text style={s.small}>{COMPANY.address}</Text>
            <Text style={s.small}>Tél : {COMPANY.phone}</Text>
            <Text style={s.small}>{COMPANY.email}</Text>
          </View>
          <View>
            <Text style={s.docTitle}>{kind}</Text>
            <Text style={s.docNum}>{doc.number}</Text>
            <Text style={[s.small, { textAlign: "right", marginTop: 6 }]}>Date : {formatDate(doc.date)}</Text>
            {secondDate ? <Text style={[s.small, { textAlign: "right" }]}>{secondLabel} : {formatDate(secondDate)}</Text> : null}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.label}>Adressé à</Text>
          <Text style={s.clientName}>{doc.clientName}</Text>
          {doc.clientCompany ? <Text>{doc.clientCompany}</Text> : null}
          {doc.clientAddress ? <Text style={s.small}>{doc.clientAddress}</Text> : null}
          {doc.clientPhone || doc.clientEmail ? (
            <Text style={s.small}>{[doc.clientPhone, doc.clientEmail].filter(Boolean).join("  ·  ")}</Text>
          ) : null}
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={s.row}>
            <Text style={[s.th, { flex: 1 }]}>Description</Text>
            <Text style={[s.th, { width: 40, textAlign: "right" }]}>Qté</Text>
            <Text style={[s.th, { width: 85, textAlign: "right" }]}>P.U.</Text>
            <Text style={[s.th, { width: 95, textAlign: "right" }]}>Total</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={s.row}>
              <Text style={[s.td, { flex: 1 }]}>{it.description}</Text>
              <Text style={[s.td, { width: 40, textAlign: "right" }]}>{it.quantity}</Text>
              <Text style={[s.td, { width: 85, textAlign: "right" }]}>{money(it.unitPrice)}</Text>
              <Text style={[s.td, { width: 95, textAlign: "right" }]}>{money(it.quantity * it.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={s.totalsBox}>
          <View style={s.tRow}><Text style={{ color: GREY }}>Sous-total</Text><Text>{money(subtotal)}</Text></View>
          {discount > 0 ? <View style={s.tRow}><Text style={{ color: GREY }}>Remise</Text><Text>- {money(discount)}</Text></View> : null}
          <View style={s.tRow}><Text style={{ color: GREY }}>TVA ({doc.taxRate}%)</Text><Text>{money(tax)}</Text></View>
          <View style={s.grand}><Text style={s.bold}>Total TTC</Text><Text style={s.bold}>{money(total)}</Text></View>
          {kind === "FACTURE" ? (
            <View>
              <View style={s.tRow}><Text style={{ color: GREY }}>Payé</Text><Text>{money(paid)}</Text></View>
              <View style={s.tRow}><Text style={{ fontFamily: "Helvetica-Bold" }}>Reste à payer</Text><Text style={{ fontFamily: "Helvetica-Bold" }}>{money(balance)}</Text></View>
            </View>
          ) : null}
        </View>

        {doc.notes ? (
          <View style={s.section}><Text style={s.label}>Notes</Text><Text style={s.small}>{doc.notes}</Text></View>
        ) : null}
        {kind === "FACTURE" && settings?.bankDetails ? (
          <View style={s.bankBox}><Text style={s.label}>Coordonnées de paiement</Text><Text style={s.small}>{settings.bankDetails}</Text></View>
        ) : null}
        {settings?.paymentTerms ? (
          <View style={s.section}><Text style={s.label}>Conditions</Text><Text style={s.small}>{settings.paymentTerms}</Text></View>
        ) : null}

        <View style={s.footer} fixed>
          <Text>{COMPANY.name} — NIF : {COMPANY.nif} · RCCM : {COMPANY.rccm}</Text>
          <Text style={{ marginTop: 2 }}>{settings?.documentFooter || "Merci de votre confiance."}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderDocumentPDF(
  doc: PdfDoc,
  kind: "DEVIS" | "FACTURE",
  settings: PdfSettings,
  paid = 0,
): Promise<Buffer> {
  return renderToBuffer(<DocPDF doc={doc} kind={kind} settings={settings} paid={paid} />);
}
