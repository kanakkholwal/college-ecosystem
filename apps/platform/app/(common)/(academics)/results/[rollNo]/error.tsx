"use client";
import { StaticStep } from "@/components/common/step";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorBanner from "@/components/utils/error";
import { ButtonLink } from "@/components/utils/link";
import { Contact, Terminal } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { appConfig } from "~/project.config";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error occurred:", error);
  }, [error]);
  return (
    <div className="flex items-center justify-center w-full h-full space-y-10 flex-col max-w-5xl mx-auto mt-20">
      <ErrorBanner
        title={"Oops! Something went wrong"}
        description={
          error?.message ||
          "If you had UMC(unfair means) or result not on the college site then it can't be helped, otherwise Try instructions below"
        }
      />
      <Alert>
        <Terminal className="size-4" />
        <AlertTitle className="text-foreground">
          If you had UMC(unfair means) or result not on the college site then it
          can{"'"}t be helped,otherwise Try instructions below
        </AlertTitle>
        <AlertDescription className="mb-2 text-muted-foreground">
          If you are still facing following issues then follow steps or please
          contact the support team.
        </AlertDescription>
        <StaticStep step={1} title="How to add my result to portal?">
          Open the this in new tab{" "}
          <a
            href={`${pathname}?update=true`}
            className="ml-2 text-primary underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {pathname}?update=true
          </a>
        </StaticStep>
        <StaticStep step={2} title="How to update my result?">
          Open the this in new tab{" "}
          <a
            href={`${pathname}?new=true`}
            className="ml-2 text-primary underline"
          >
            {pathname}?new=true
          </a>
        </StaticStep>
        <StaticStep step={3} title="How to update my result?">
          Open the this in new tab{" "}
          <a
            href={`/results?cache=new`}
            className="ml-2 text-primary underline"
          >
            /results?cache=new
          </a>
        </StaticStep>
        <ButtonLink
          href={appConfig.contact}
          className="mt-4"
          variant="dark"
          size="sm"
          target="_blank"
        >
          <Contact />
          Contact Support
        </ButtonLink>
      </Alert>
    </div>
  );
}
