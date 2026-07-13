import { z } from "zod";

/** Shape accepted by POST /api/contact. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  email: z.string().trim().email("Email invalide").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court").max(5000),
  source: z.string().trim().max(200).optional(),
  // Honeypot: bots fill this hidden field; humans never do.
  website: z.string().max(0).optional(),
});

/** Shape accepted by POST /api/quote. */
export const quoteSchema = contactSchema.extend({
  sector: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;

/** Flatten Zod issues into a { field: message } map for API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
