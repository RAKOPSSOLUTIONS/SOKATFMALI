import nodemailer from "nodemailer";
import { getSettings } from "./settings";

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
  // Recipient: admin-configured setting → env → sensible default.
  let notify: string | null = null;
  try {
    notify = (await getSettings()).notifyEmail;
  } catch {
    /* settings unavailable → fall through */
  }
  const to = notify || process.env.LEADS_NOTIFY_TO || "contact@sokatf.com";
  const from = process.env.SMTP_FROM || "SOKATF SARL <no-reply@sokatf.com>";
  const kind = lead.type === "QUOTE" ? "Demande de devis" : "Nouveau contact";
  const subject = `[${kind}] ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`;

  const rows: [string, string | null | undefined][] = [
    ["Type", kind],
    ["Nom", lead.name],
    ["Email", lead.email],
    ["Téléphone", lead.phone],
    ["Société", lead.company],
    ["Secteur", lead.sector],
    ["Budget", lead.budget],
    ["Source", lead.source],
  ];
  const text = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k.padEnd(10)}: ${v}`),
    "",
    "Message :",
    lead.message,
  ].join("\n");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="height:6px;background:linear-gradient(90deg,#0f172a,#b8860b,#fed65b)"></div>
      <div style="padding:24px">
        <h2 style="margin:0 0 4px;color:#0f172a;font-size:18px">${kind}</h2>
        <p style="margin:0 0 16px;color:#64748b;font-size:13px">SOKATF SARL — notification automatique</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:6px 0;color:#64748b;width:110px">${k}</td><td style="padding:6px 0;color:#0f172a;font-weight:600">${v}</td></tr>`).join("")}
        </table>
        <div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;color:#334155;white-space:pre-wrap">${lead.message.replace(/</g, "&lt;")}</div>
        <a href="mailto:${lead.email}" style="display:inline-block;margin-top:16px;padding:10px 18px;background:#0f172a;color:#fed65b;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Répondre à ${lead.name}</a>
      </div>
    </div>`;

  const transport = getTransport();
  if (!transport) {
    console.log(`\n[mailer] SMTP not configured — would email "${to}":\n${text}\n`);
    return;
  }
  try {
    await transport.sendMail({ from, to, replyTo: lead.email, subject, text, html });
  } catch (err) {
    // Never fail the lead submission just because the notification bounced.
    console.error("[mailer] failed to send lead notification:", err);
  }
}
