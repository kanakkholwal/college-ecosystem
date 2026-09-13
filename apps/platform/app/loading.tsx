import { ApplicationSvgLogo } from "@/components/logo";
import { appConfig } from "~/project.config";
import "./loading.css";

export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="boot fixed inset-0 z-100 grid place-items-center bg-canvas text-foreground"
    >
      <div className="boot-stack flex flex-col items-center gap-7">
        <ApplicationSvgLogo className="boot-mark size-11" aria-hidden="true" />
        <div className="boot-track relative h-0.5 w-24 overflow-hidden rounded-full bg-border">
          <span className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-primary" />
        </div>
        <span className="sr-only">Loading {appConfig.name}</span>
      </div>
    </div>
  );
}
