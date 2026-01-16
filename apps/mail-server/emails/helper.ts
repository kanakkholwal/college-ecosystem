import { appConfig, SMTP_SETTINGS } from "@/project.config";
import { mailerPayloadSchema, type MailerPayload } from "@/types/schema";
import nodemailer from "nodemailer";



export const handleEmailFire = async (from: string, data: MailerPayload) => {
  // Validate the payload`
  const res = mailerPayloadSchema.safeParse(data);
  if (!res.success) {
    throw new Error(res.error.message);
  }
  const transporter = nodemailer.createTransport({
    ...SMTP_SETTINGS,
  });

  return await transporter.sendMail({
    from: from, // 'Sender Name <sender@server.com>'
    replyTo: from, // Optional: Set reply-to to the sender
    ...res.data, // to, subject, html
    headers: {
      "X-Mailer": appConfig.name,
      'List-Unsubscribe': `<mailto:unsubscribe@${appConfig.appDomain}>`,
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'All',
      'Auto-Submitted': 'auto-generated',
    },
  });
};