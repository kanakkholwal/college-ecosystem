
import { appConfig } from "@/project.config";
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


export function ResultUpdateEmail({ payload }: { payload: EmailPayload }) {
  const batch = payload.batch as string;
  
  const previewText = `Semester results for ${batch} batch have been released. Click to view your results with ranking.`;

  return (
    <>
      <Preview>{previewText}</Preview>
      <Heading className="text-black text-[16px] font-medium text-center p-0 my-[30px] mx-auto">
        Semester Result Notification
      </Heading>
      <Text className="text-black text-[10px] leading-[16px]">
          Hi students of <strong>{batch}</strong> batch,
      </Text>
      <Text className="text-black text-[10px] leading-[16px]">
        Your semester results have been released. You can view your results with ranking
        by clicking the button below.
      </Text>
      <Section className="text-center my-[32px]">
        <Button
          className="bg-brand rounded text-white text-[10px] font-semibold no-underline text-center px-5 py-3"
          href={`${appConfig.url}/results`}
        >
          View Results
        </Button>
      </Section>
      <Text className="text-black text-[10px] leading-[16px]">
        or copy and paste this URL into your browser:{" "}
        <Link href={`${appConfig.url}/results`} className="text-brand no-underline">
          {`${appConfig.url}/results`}
        </Link>
      </Text>
      <Hr className="border border-solid border-border my-[26px] mx-0 w-full" />
      <Text className="text-muted-foreground text-[8px] leading-[10px]">
        This is an automated email from the {appConfig.name}. If you have any questions, please contact us at{" "}
        <Link href={appConfig.contact} className="text-brand no-underline">
          Contact
        </Link>
      </Text>
    </>
  );
}