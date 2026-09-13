import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { House, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile not found",
  description: "No one on the platform uses this username.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-16">
      <TiltedChip>Not found</TiltedChip>
      <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
        No profile for
        <br />
        <span className="text-primary">this username</span>
      </h1>
      <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
        Check the spelling. Accounts that were deleted don't have a profile
        either.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/community" variant="primary">
          <Users />
          Browse community
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          <House />
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
