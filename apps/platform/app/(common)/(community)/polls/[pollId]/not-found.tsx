import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poll not found",
  description: "This poll doesn't exist or was removed.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start py-16">
      <TiltedChip>Not found</TiltedChip>
      <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
        This poll
        <br />
        <span className="text-primary">isn't here</span>
      </h1>
      <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
        Its author may have deleted it, or it closed more than a week ago and
        was removed.
      </p>
      <ButtonLink href="/polls" variant="primary" className="mt-6">
        <ArrowLeft />
        Back to polls
      </ButtonLink>
    </div>
  );
}
