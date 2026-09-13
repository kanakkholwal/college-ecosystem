import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post not found",
  description: "This community post doesn't exist or was deleted.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start py-16">
      <TiltedChip>Not found</TiltedChip>
      <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
        This post
        <br />
        <span className="text-primary">isn't here</span>
      </h1>
      <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
        It may have been deleted by its author, or the link is incomplete.
      </p>
      <ButtonLink href="/community" variant="primary" className="mt-6">
        <ArrowLeft />
        Back to the feed
      </ButtonLink>
    </div>
  );
}
