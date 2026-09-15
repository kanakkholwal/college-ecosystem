import {
  EmailHeading,
  EmailLayout,
  LinkFallback,
  Note,
  Paragraph,
  PrimaryButton,
} from "../components/layout";
import { brand, firstName } from "../components/theme";

export type VerifyEmailProps = {
  name: string;
  email: string;
  verifyUrl: string;
  expiresInMinutes: number;
};

export const verifyEmailSubject = () => `Confirm your email for ${brand.name}`;

export default function VerifyEmail({
  name,
  email,
  verifyUrl,
  expiresInMinutes,
}: VerifyEmailProps) {
  return (
    <EmailLayout
      preview={`Confirm ${email} to finish setting up ${brand.name}.`}
    >
      <EmailHeading>Confirm your email</EmailHeading>
      <Paragraph>Hi {firstName(name)},</Paragraph>
      <Paragraph>
        Confirm <strong>{email}</strong> to finish setting up your {brand.name}{" "}
        account. The link signs you in straight away.
      </Paragraph>
      <PrimaryButton href={verifyUrl}>Verify email</PrimaryButton>
      <LinkFallback href={verifyUrl} />
      <Note>
        This link works once and expires in {expiresInMinutes} minutes. If you
        didn't create an account, you can ignore this email.
      </Note>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  name: "KANAK KHOLWAL",
  email: "21bec047@nith.ac.in",
  verifyUrl: "https://app.nith.eu.org/auth/verify-mail?token=preview",
  expiresInMinutes: 60,
} satisfies VerifyEmailProps;
