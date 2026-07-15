import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import { COMPANY } from "./finance";
import { logoBuffer, logoAspect } from "./brand";
import type { OrgDoc } from "./orgDocs";

const LOGO_W = 180; // header logo width (px)

const NAVY = "0F172A";
const GOLD = "B8860B";
const GREY = "64748B";

function cell(text: string, opts: { header?: boolean; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.header ? { fill: "F1F5F9" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.header, color: opts.header ? GREY : "1E293B", size: 20 })],
      }),
    ],
  });
}

export async function renderDocx(doc: OrgDoc): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Brand header (logo)
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new ImageRun({
          type: "png",
          data: logoBuffer("colors"),
          transformation: { width: LOGO_W, height: Math.round(LOGO_W / logoAspect("colors")) },
        }),
      ],
    }),
  );
  children.push(new Paragraph({ children: [new TextRun({ text: COMPANY.tagline, italics: true, size: 18, color: GREY })], spacing: { after: 200 } }));

  // Title
  children.push(new Paragraph({ text: doc.title, heading: HeadingLevel.HEADING_1, spacing: { before: 120, after: 60 } }));
  if (doc.subtitle) {
    children.push(new Paragraph({ children: [new TextRun({ text: doc.subtitle, italics: true, color: GOLD, size: 22 })], spacing: { after: 200 } }));
  }

  for (const b of doc.blocks) {
    if (b.type === "h2") {
      children.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 } }));
    } else if (b.type === "p") {
      children.push(new Paragraph({ children: [new TextRun({ text: b.text, size: 22 })], spacing: { after: 120 } }));
    } else if (b.type === "ul") {
      for (const it of b.items) children.push(new Paragraph({ text: it, bullet: { level: 0 }, spacing: { after: 40 } }));
    } else if (b.type === "ol") {
      b.items.forEach((it, i) => children.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${it}`, size: 22 })], spacing: { after: 40 } })));
    } else if (b.type === "table") {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ tableHeader: true, children: b.head.map((h) => cell(h, { header: true })) }),
            ...b.rows.map((r) => new TableRow({ children: r.map((c) => cell(c)) })),
          ],
        }),
      );
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    } else if (b.type === "org") {
      b.levels.forEach((lvl, i) => {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 20 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
            children: [
              new TextRun({ text: lvl.role, bold: true, color: NAVY, size: 22 }),
              new TextRun({ text: `  —  ${lvl.name}`, color: GOLD, size: 22 }),
            ],
          }),
        );
        if (i < b.levels.length - 1) {
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "▼", color: GREY })], spacing: { after: 20 } }));
        }
      });
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" } },
      children: [new TextRun({ text: `${COMPANY.name} — NIF : ${COMPANY.nif} · RCCM : ${COMPANY.rccm}`, size: 16, color: GREY })],
    }),
  );
  children.push(new Paragraph({ children: [new TextRun({ text: `${COMPANY.address} · Tél : ${COMPANY.phone} · ${COMPANY.email}`, size: 16, color: GREY })] }));

  const document = new Document({
    creator: COMPANY.name,
    title: doc.title,
    sections: [{ properties: {}, children }],
  });
  return Packer.toBuffer(document);
}
