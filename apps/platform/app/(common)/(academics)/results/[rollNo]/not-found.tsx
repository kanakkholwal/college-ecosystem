import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { RecoverySteps } from "./recovery-steps";

export const metadata: Metadata = {
  title: "Result Not Found",
  description: "The result you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-col items-start">
        <TiltedChip>Not found</TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          No result for
          <br />
          <span className="text-primary">this roll number</span>
        </h1>
        <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          Check the roll number, or fetch the result from the college site.
        </p>
        <div className="mt-6">
          <ButtonLink href="/results" variant="primary">
            <Search />
            Search results
          </ButtonLink>
        </div>
      </div>
      <RecoverySteps />
    </div>
  );
}
