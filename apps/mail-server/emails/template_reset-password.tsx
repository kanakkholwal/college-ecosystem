import type { EmailPayload } from "@/types/schema";
import {
  Button,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components";


export function ResetPasswordEmail({ payload }: { payload: EmailPayload }) {
  const email = payload.email as string;
  const userName = payload.name as string;
  const previewText = `Hi ${userName}, Click the button below to reset your password.`;
  const resetLink = payload.reset_link as string;

  return (
    <>
      <Preview>{previewText}</Preview>
      <Heading className="text-black text-[16px] font-medium text-center p-0 my-[30px] mx-auto">
        Reset your password
      </Heading>
      <Text className="text-black text-[10px] leading-[16px]">
        Hello <strong>{userName}</strong>,
      </Text>
      <Text className="text-black text-[10px] leading-[16px]">
        You recently requested to reset your password for your account with the
        email address <strong>{email}</strong>. Click the button below to reset
        it.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-brand rounded text-white text-[10px] font-semibold no-underline text-center px-5 py-3"
          href={resetLink}
        >
          Reset Password
        </Button>
      </Section>
      <Text className="text-black text-[10px] leading-[16px]">
        or copy and paste this URL into your browser:{" "}
        <Link href={resetLink} className="text-blue-600 no-underline">
          {resetLink}
        </Link>
      </Text>
      <Hr className="border border-solid border-border my-[26px] mx-0 w-full" />
      <Text className="text-muted-foreground text-[8px] leading-[10px]">
        If you did not request a password reset, please ignore this email or
        reply to let us know. This password reset is only valid for the next 30
        minutes.
      </Text>
    </>
  );
}