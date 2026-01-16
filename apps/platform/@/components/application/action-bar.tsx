"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

interface ActionBarProps {
  className?: string;
  title?: string;
  description?: React.ReactNode;
  btnProps: React.ComponentProps<typeof Button>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  action: () => Promise<any>;
}

export function ActionBar({
  className,
  title,
  description,
  btnProps,
  action,
}: ActionBarProps) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      await toast
        .promise(action(), {
          loading: "Taking action...",
          success: (msg: string | undefined) => {
            return msg || "Action completed successfully";
          },
          error: (msg: string | undefined) => {
            return msg || "An error occurred while taking action";
          },
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while taking action");
    }
  };

  return (
    <div
      className={cn("grid grid-cols-1 gap-1.5 justify-items-end", className)}
    >
      <h5 className="text-base font-medium">{title}</h5>
      <p className="text-sm text-muted-foreground text-left">{description}</p>
      <Button {...btnProps} disabled={loading} onClick={handleAction}>
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" size={24} />
            Taking action...
          </>
        ) : (
          btnProps.children
        )}
      </Button>
    </div>
  );
}
interface ActionButtonProps extends ButtonProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  action: () => Promise<any>;
  actionName?: string;
  loadingLabel?: string;
}
export function ActionButton({
  loadingLabel = "Taking action...",
  actionName = "Talking action",
  action,
  children,
  ...props
}: ActionButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      await toast
        .promise(action(), {
          loading: loadingLabel,
          success: (msg: string | undefined) => {
            return msg || actionName + " completed successfully";
          },
          error: (msg: string | undefined) => {
            return msg || "An error occurred while " + loadingLabel;
          },
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("ActionButton error:", err);
      toast.error("An error occurred while " + loadingLabel);
    }
  };

  return (
    <Button {...props} disabled={loading} onClick={handleAction}>
      {loading ? (
        <>
          <LoaderCircle className="animate-spin" size={24} />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
