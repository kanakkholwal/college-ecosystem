import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 justify-center items-center mx-auto mt",
        className
      )}
    >
      <h1 className="text-2xl md:text-7xl font-bold text-center relative bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
        NITH
      </h1>
      <h2 className="text-md md:text-xl font-semibold capitalize text-slate-700 text-center">
        {process.env.NEXT_PUBLIC_WEBSITE_NAME}
      </h2>
    </div>
  );
}
