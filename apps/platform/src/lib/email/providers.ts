import nodemailer, { type Transporter } from "nodemailer";

export const EMAIL_PROVIDERS = ["smtp", "resend", "brevo", "console"] as const;
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[email] Missing environment variable: ${name}`);
  return value;
}

// Every provider is a nodemailer transport, so adding one is a single entry here.
const transports: Record<EmailProvider, () => Transporter> = {
  smtp: () =>
    nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      // Local catchers like Mailpit take no credentials.
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    }),
  resend: () =>
    nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: requireEnv("RESEND_API_KEY") },
    }),
  brevo: () =>
    nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: requireEnv("BREVO_SMTP_LOGIN"),
        pass: requireEnv("BREVO_SMTP_KEY"),
      },
    }),
  console: () => nodemailer.createTransport({ jsonTransport: true }),
};

function isEmailProvider(value: string): value is EmailProvider {
  return (EMAIL_PROVIDERS as readonly string[]).includes(value);
}

export function resolveEmailProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[email] EMAIL_PROVIDER is required in production");
    }
    return "console";
  }
  if (!isEmailProvider(configured)) {
    throw new Error(
      `[email] Unknown EMAIL_PROVIDER "${configured}". Use one of: ${EMAIL_PROVIDERS.join(", ")}`
    );
  }
  return configured;
}

let cached: { provider: EmailProvider; transport: Transporter } | null = null;

export function getTransport() {
  if (!cached) {
    const provider = resolveEmailProvider();
    cached = { provider, transport: transports[provider]() };
  }
  return cached;
}
