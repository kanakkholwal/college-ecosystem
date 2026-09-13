import type { Metadata } from "next";
import { ErrorState } from "@/components/site/error-state";
import { RailFrame, RailRow } from "@/components/site/rail";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <RailFrame>
      <RailRow divider={false} label="Error 404" className="flex-1">
        <div className="px-1 pt-16 pb-14 sm:px-4 sm:pt-24 sm:pb-20 lg:px-16">
          <ErrorState variant="404" />
        </div>
      </RailRow>
    </RailFrame>
  );
}
