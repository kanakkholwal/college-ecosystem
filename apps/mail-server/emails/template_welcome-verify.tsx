import { Button, Hr, Preview, Section, Text } from "@react-email/components";
import { z } from "zod";

const payloadSchema = z.record(
  z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())])
);

type Payload = z.infer<typeof payloadSchema>;

export function WelcomeVerifyEmail({ payload }: { payload: Payload }) {
  const platform_name = payload.platform_name as string;
  const userName = payload.name as string;
  const previewText = `Welcome to ${platform_name}! Verify your email address to get started.`;
  const verifyUrl = payload.verification_url as string;

  return (
    <>
      <Preview>{previewText}</Preview>
      <Text className="text-black text-[10px] leading-[16px]">
        Hi {userName},{"\n"}
        Welcome to <strong>{platform_name}</strong>! We're thrilled to have you
        join our community.
      </Text>
      <Text className="text-black text-[10px] leading-[16px]">
        Please verify your email address ({payload.email}) to get started.
      </Text>
      <Section className="text-center my-[32px]">

      <Button
          className="bg-brand rounded text-white text-[10px] font-semibold no-underline text-center px-5 py-3"
        href={verifyUrl}
      >
        Verify Email
      </Button>
      </Section>
      <Hr className="border border-solid border-border my-[26px] mx-0 w-full" />
      <Text className="text-muted-foreground text-[8px] leading-[10px]">
        If you didn't create an account, you can safely ignore this email.
      </Text>
      <Text className="text-black text-[10px] leading-[16px] mt-6">
        — The {platform_name} Team
      </Text>
    </>
  );
}
