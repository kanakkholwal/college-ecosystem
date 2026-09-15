import { render, toPlainText } from "@react-email/components";
import type { ReactElement } from "react";
import { appConfig } from "~/project.config";
import { getTransport } from "./providers";
import ResetPassword, {
  type ResetPasswordProps,
  resetPasswordSubject,
} from "./templates/reset-password";
import ResultUpdate, {
  type ResultUpdateProps,
} from "./templates/result-update";
import VerifyEmail, {
  type VerifyEmailProps,
  verifyEmailSubject,
} from "./templates/verify-email";

type TemplateDef<P> = {
  render: (props: P) => ReactElement;
  subject: (props: P) => string;
  /** Bulk mail hides recipients from each other and carries unsubscribe headers. */
  bulk?: boolean;
};

const define = <P,>(def: TemplateDef<P>) => def;

export const emailTemplates = {
  "verify-email": define<VerifyEmailProps>({
    render: (props) => <VerifyEmail {...props} />,
    subject: verifyEmailSubject,
  }),
  "reset-password": define<ResetPasswordProps>({
    render: (props) => <ResetPassword {...props} />,
    subject: resetPasswordSubject,
  }),
  "result-update": define<ResultUpdateProps & { subject: string }>({
    render: ({ subject: _, ...props }) => <ResultUpdate {...props} />,
    subject: (props) => props.subject,
    bulk: true,
  }),
};

export type EmailTemplateId = keyof typeof emailTemplates;
export type EmailTemplateProps<T extends EmailTemplateId> = Parameters<
  (typeof emailTemplates)[T]["render"]
>[0];

// Resend caps one message at 50 recipients; Brevo and most SMTP relays allow at least that.
const MAX_RECIPIENTS_PER_MESSAGE = 50;

const DEFAULT_FROM = `${appConfig.name} <platform@${appConfig.appDomain}>`;

export type SendEmailResult = { accepted: string[]; rejected: string[] };

function addressList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list.map((entry) =>
    typeof entry === "string" ? entry : String(entry?.address ?? "")
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

/** Renders a template and sends it through the provider picked by `EMAIL_PROVIDER`. Server only. */
export async function sendEmail<T extends EmailTemplateId>({
  template,
  to,
  props,
}: {
  template: T;
  to: string | string[];
  props: EmailTemplateProps<T>;
}): Promise<SendEmailResult> {
  // Each entry's props match its own render/subject; TS can't correlate them through the generic.
  const def = emailTemplates[template] as unknown as TemplateDef<
    EmailTemplateProps<T>
  >;
  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length === 0) return { accepted: [], rejected: [] };

  const html = await render(def.render(props));
  const text = toPlainText(html);
  const subject = def.subject(props);
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || undefined;
  const { provider, transport } = getTransport();

  const batches = def.bulk
    ? chunk(recipients, MAX_RECIPIENTS_PER_MESSAGE)
    : [recipients];
  const result: SendEmailResult = { accepted: [], rejected: [] };

  for (const batch of batches) {
    const info = await transport.sendMail({
      from,
      replyTo,
      subject,
      html,
      text,
      ...(def.bulk ? { to: from, bcc: batch } : { to: batch }),
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
        ...(def.bulk && {
          Precedence: "bulk",
          "List-Unsubscribe": `<mailto:unsubscribe@${appConfig.appDomain}>`,
        }),
      },
    });

    if (provider === "console") {
      console.info(
        `[email:console] ${template} -> ${batch.join(", ")}\nSubject: ${subject}\n\n${text}`
      );
    }
    const rejected = new Set(addressList(info.rejected));
    result.rejected.push(...rejected);
    result.accepted.push(...batch.filter((address) => !rejected.has(address)));
  }

  return result;
}
