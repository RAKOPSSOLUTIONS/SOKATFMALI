import { prisma } from "./prisma";

export type Settings = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  defaultTaxRate: number;
  paymentTerms: string | null;
  bankDetails: string | null;
  documentFooter: string | null;
  quotePrefix: string;
  invoicePrefix: string;
  numberIncludeMonth: boolean;
  numberPadding: number;
};

const DEFAULTS: Settings = {
  id: "singleton",
  companyName: "SOKATF SARL",
  logoUrl: null,
  defaultTaxRate: 18,
  paymentTerms: null,
  bankDetails: null,
  documentFooter: null,
  quotePrefix: "Devis",
  invoicePrefix: "Facture",
  numberIncludeMonth: true,
  numberPadding: 4,
};

/** Read the singleton settings row (returns sane defaults if unset). */
export async function getSettings(): Promise<Settings> {
  const s = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!s) return DEFAULTS;
  return {
    id: s.id,
    companyName: s.companyName,
    logoUrl: s.logoUrl,
    defaultTaxRate: s.defaultTaxRate,
    paymentTerms: s.paymentTerms,
    bankDetails: s.bankDetails,
    documentFooter: s.documentFooter,
    quotePrefix: s.quotePrefix || "Devis",
    invoicePrefix: s.invoicePrefix || "Facture",
    numberIncludeMonth: s.numberIncludeMonth,
    numberPadding: s.numberPadding && s.numberPadding > 0 ? s.numberPadding : 4,
  };
}
