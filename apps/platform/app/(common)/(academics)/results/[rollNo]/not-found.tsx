import NotFoundContainer from "@/components/common/not-found";
import { Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Result Not Found ",
  description: "The result you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <NotFoundContainer
      className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6"
      title="Result Not Found"
      description="The result you are looking for does not exist or has been removed."
      actionProps={{
        href: "/results",
        children: (
          <>
            <Globe />
            Go to Results
          </>
        ),
      }}
    />
  );
}
