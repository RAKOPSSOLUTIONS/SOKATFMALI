import nodemailer from "nodemailer";

type LeadEmail = {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  sector?: string | null;
  budget?: string | null;
  message: string;
  source?: string | null;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null; // Not configured → dev console mode.
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

/**
 * Generic send helper. When SMTP is not configured, logs to the console
 * instead of sending (dev-friendly). Returns true on success.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<boolean> {
  const from = process.env.SMTP_FROM || "SOKATF SARL <no-reply@sokatf.com>";
  const transport = getTransport();
  if (!transport) {
    console.log(`\n[mailer] SMTP not configured — would email "${opts.to}": ${opts.subject}\n${opts.text ?? opts.html ?? ""}\n`);
    return true;
  }
  try {
    await transport.sendMail({ from, ...opts });
    return true;
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return false;
  }
}

/**
 * Notify the SOKATF team of a new lead. When SMTP is not configured (dev),
 * the message is logged to the console instead of being sent — so the flow
 * still works end-to-end locally.
 */
export async function sendLeadNotification(lead: LeadEmail): Promise<void> {
  const to = process.env.LEADS_NOTIFY_TO || "contact@sokatf-sarl.com";
  const from =
    process.env.SMTP_FROM || "SOKATF-SARL <no-reply@sokatf-sarl.com>";
  const subject = `[${lead.type}] Nouveau contact — ${lead.name}`;
  const lines = [
    `Type      : ${lead.type}`,
    `Nom       : ${lead.name}`,
    `Email     : ${lead.email}`,
    lead.phone ? `Téléphone : ${lead.phone}` : null,
    lead.company ? `Société   : ${lead.company}` : null,
    lead.sector ? `Secteur   : ${lead.sector}` : null,
    lead.budget ? `Budget    : ${lead.budget}` : null,
    lead.source ? `Source    : ${lead.source}` : null,
    "",
    "Message :",
    lead.message,
  ].filter(Boolean);
  const text = lines.join("\n");

  const transport = getTransport();
  if (!transport) {
    console.log(
      `\n[mailer] SMTP not configured — would email "${to}":\n${text}\n`,
    );
    return;
  }

  try {
    await transport.sendMail({ from, to, replyTo: lead.email, subject, text });
  } catch (err) {
    // Never fail the lead submission just because the notification bounced.
    console.error("[mailer] failed to send lead notification:", err);
  }
}
