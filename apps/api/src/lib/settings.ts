import { prisma } from "./prisma";

export type Settings = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  defaultTaxRate: number;
  paymentTerms: string | null;
  bankDetails: string | null;
  documentFooter: string | null;
};

const DEFAULTS: Settings = {
  id: "singleton",
  companyName: "SOKATF SARL",
  logoUrl: null,
  defaultTaxRate: 18,
  paymentTerms: null,
  bankDetails: null,
  documentFooter: null,
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
  };
}
