/** Allowed string-enum values (SQLite has no native enums). */

export const LEAD_TYPES = ["CONTACT", "QUOTE"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const PROJECT_STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Design-token accent keys sectors may use (kept in sync with @sokatf/tokens). */
export const ACCENTS = ["primary", "secondary", "tertiary-fixed-dim", "error"] as const;
export type Accent = (typeof ACCENTS)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturé",
};
