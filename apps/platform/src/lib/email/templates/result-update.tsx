import {
  EmailHeading,
  EmailLayout,
  LinkFallback,
  Note,
  Paragraph,
  PrimaryButton,
} from "../components/layout";
import { brand } from "../components/theme";

export type ResultUpdateProps = {
  academicYear: string;
  resultsUrl: string;
};

export default function ResultUpdate({
  academicYear,
  resultsUrl,
}: ResultUpdateProps) {
  return (
    <EmailLayout
      preview={`Semester results for ${academicYear} are out. See your grades and rank.`}
    >
      <EmailHeading>Your semester results are out</EmailHeading>
      <Paragraph>
        Results for the <strong>{academicYear}</strong> academic year are now on{" "}
        {brand.name}.
      </Paragraph>
      <Paragraph>
        Open them to see your SGPI, CGPI, and where you rank in your batch and
        branch.
      </Paragraph>
      <PrimaryButton href={resultsUrl}>View results</PrimaryButton>
      <LinkFallback href={resultsUrl} />
      <Note>
        You're getting this because you're a student at {brand.orgName}. Spot a
        mistake in your result? Use the contact link below.
      </Note>
    </EmailLayout>
  );
}

ResultUpdate.PreviewProps = {
  academicYear: "2025-2026",
  resultsUrl: "https://app.nith.eu.org/results",
} satisfies ResultUpdateProps;
