"use client";

import { AlertCircle, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import * as React from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useFormState,
} from "react-hook-form";
import { Icon } from "@/components/icons";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
import { orgConfig } from "~/project.config";

// 16px below md stops iOS Safari zooming into the field on focus.
export const authInputClass =
  "h-10 rounded-md border-border bg-background text-body-lg font-normal md:text-body placeholder:text-placeholder focus-visible:border-ring focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring invalid:ring-ring aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive";

export const authLabelClass = "mb-0 text-body font-medium text-foreground";

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn(authInputClass, "pr-11", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

/** Lists client validation errors after a failed submit; each entry focuses its field. */
export function ErrorSummary<T extends FieldValues>({
  control,
  labels,
  visible,
  onSelect,
}: {
  control: Control<T>;
  labels: Partial<Record<Path<T>, string>>;
  visible: boolean;
  onSelect: (name: Path<T>) => void;
}) {
  const { errors } = useFormState({ control });
  if (!visible) return null;
  const invalid = (Object.keys(labels) as Path<T>[]).filter(
    (name) => errors[name]
  );
  if (invalid.length === 0) return null;

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-body"
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="font-medium text-destructive">
          {invalid.length === 1
            ? "1 field needs attention"
            : `${invalid.length} fields need attention`}
        </p>
        <ul className="space-y-0.5">
          {invalid.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onSelect(name)}
                className="text-left text-foreground underline underline-offset-4 hover:text-primary"
              >
                {labels[name]}: {String(errors[name]?.message ?? "Invalid")}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
  className,
  ...props
}: ButtonProps & { pending: boolean; pendingLabel: string }) {
  return (
    <>
      <Button
        type="submit"
        disabled={pending}
        className={cn("w-full", className)}
        {...props}
      >
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {pending ? pendingLabel : children}
      </Button>
      <span className="sr-only" aria-live="polite">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}

export function OrgEmailNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex gap-2 text-caption text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        {children ?? (
          <>
            Use your{" "}
            <span className="font-medium text-foreground">
              {orgConfig.mailSuffix}
            </span>{" "}
            account. Personal addresses can't sign in.
          </>
        )}
      </span>
    </p>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-caption text-muted-foreground">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {label}
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

/** Starts Google OAuth; stays pending while the browser leaves for Google. */
export function GoogleButton({
  callbackURL,
  label,
  disabled,
  onStart,
  onError,
}: {
  callbackURL: string;
  label: string;
  disabled?: boolean;
  onStart?: () => void;
  onError?: (error: AuthErrorInfo) => void;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    onStart?.();
    const res = await authClient.signIn.social(
      { provider: "google", callbackURL },
      {
        onError: (ctx) => {
          onError?.(getAuthError(ctx.error));
        },
      }
    );
    if (res?.error) setPending(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full px-4"
        disabled={disabled || pending}
        onClick={handleClick}
      >
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-sm bg-fixed-light">
            <Icon name="google:colored" className="size-4" />
          </span>
        )}
        {pending ? "Opening Google..." : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {pending ? "Opening Google sign in" : ""}
      </span>
    </>
  );
}
