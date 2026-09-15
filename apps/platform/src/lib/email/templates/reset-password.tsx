import {
  EmailHeading,
  EmailLayout,
  LinkFallback,
  Note,
  Paragraph,
  PrimaryButton,
} from "../components/layout";
import { brand, firstName } from "../components/theme";

export type ResetPasswordProps = {
  name: string;
  email: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export const resetPasswordSubject = () => `Reset your ${brand.name} password`;

export default function ResetPassword({
  name,
  email,
  resetUrl,
  expiresInMinutes,
}: ResetPasswordProps) {
  return (
    <EmailLayout preview="Use this link to choose a new password.">
      <EmailHeading>Reset your password</EmailHeading>
      <Paragraph>Hi {firstName(name)},</Paragraph>
      <Paragraph>
        We got a request to reset the password for <strong>{email}</strong>.
        Choose a new one with the button below.
      </Paragraph>
      <PrimaryButton href={resetUrl}>Choose a new password</PrimaryButton>
      <LinkFallback href={resetUrl} />
      <Note>
        This link works once and expires in {expiresInMinutes} minutes. If you
        didn't ask for this, ignore this email; your password stays the same.
      </Note>
    </EmailLayout>
  );
}

ResetPassword.PreviewProps = {
  name: "KANAK KHOLWAL",
  email: "21bec047@nith.ac.in",
  resetUrl: "https://app.nith.eu.org/auth/reset-password?token=preview",
  expiresInMinutes: 60,
} satisfies ResetPasswordProps;
