import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

export function OrSeparator() {
  return (
    <div className="flex items-center justify-between my-4">
      <hr className="flex-grow border-t border-gray-300" />
      <span className="mx-2 text-gray-500">or</span>
      <hr className="flex-grow border-t border-gray-300" />
    </div>
  );
}
export function NoteSeparator({
  label = "Note",
  className,
  labelClassName,
}: {
  label: string;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start gap-2 mx-auto px-4 py-2 max-w-(--max-app-width) overflow-hidden",
        className
      )}
    >
      <span
        className={cn(
          "text-muted-foreground text-sm px-4 py-2 whitespace-nowrap",
          labelClassName
        )}
      >
        {label}
      </span>
      <Separator orientation="horizontal" className="max-w-full" />
    </div>
  );
}
