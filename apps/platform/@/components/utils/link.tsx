"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { getWindowOrigin } from "@/lib/env";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "../icons";
import { ResponsiveDialog } from "../ui/responsive-dialog";

type RedirectButtonProps = ButtonProps & {
  href: string;
  children?: React.ReactNode;
}
export function RedirectWithSearchParamsLink({
  href,
  children,
  ...props
}: RedirectButtonProps) {
  const searchParams = useSearchParams();
  const url = new URL(href, getWindowOrigin());
  searchParams.entries().forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return (
    <Button
      rounded="full"
      variant="default_soft"
      width="sm"
      effect="shineHover"
      {...props}
      asChild
    >
      <Link href={url.toString()}>{children}</Link>
    </Button>
  );
}
export function PreviousPageLink({ ...props }: ButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Button
      rounded="full"
      variant="ghost"
      onClick={() => {
        window?.history?.length > 1
          ? router.back()
          : router.push(pathname.split("/").splice(-1).join("/"));
      }}
      icon={props.children ? undefined : "arrow-left"}
      {...props}
    >
      {props.children ? props.children : "Go Back"}
    </Button>
  );
}

export function ButtonLink({
  href,
  children,
  ...props
}: React.ComponentProps<typeof Button> & React.ComponentProps<typeof Link>) {
  return (
    <Button asChild {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
export function AuthButtonLink({
  href,
  authorized,
  children,
  ...props
}: React.ComponentProps<typeof Button> &
  React.ComponentProps<typeof Link> & {
    authorized?: boolean;
  }) {

  return (
    <Button asChild {...props}>
      <Link href={authorized ? href : `/auth/sign-in?next=${href}`}>
        {children}
      </Link>
    </Button>
  );
}
function AuthActionButton({
  authorized,
  dialog,
  nextUrl,
  ...props
}: React.ComponentProps<typeof Button> & {
  authorized?: boolean;
  nextUrl?: string;
  dialog?: {
    title: string;
    description: string;
    content?: React.ReactNode;
    showHeader?: boolean;
  }
}) {
  const pathname = usePathname();

  if (!authorized) {
    // If not authorized, show a dialog with sign-in option
    const { onClick, ...restProps } = props;
    return (
      <ResponsiveDialog
        hideHeader={true}
        title={dialog?.title ?? "Sign In Required"}
        description={dialog?.description ?? "You need to sign in to perform this action"}
        btnProps={{
          ...restProps
        }}
      >
        {dialog?.content ? (
          <div className="mt-4">{dialog.content}</div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted shadow-sm mb-4">
              <Icon name="lock" className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Authentication Needed</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You need to sign in to access this feature. Please continue with your account to unlock it.
            </p>
          </div>
        )}

        <AuthButtonLink
          href={nextUrl ? nextUrl : pathname}
          authorized={false}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2.5 font-medium shadow-md hover:shadow-lg transition-all"
        >
          Sign In to Continue
          <Icon name="arrow-right" className="w-4 h-4" />
        </AuthButtonLink>
      </ResponsiveDialog>
    );
  }

  return <Button {...props} />;
}

AuthActionButton.displayName = "AuthActionButton";
export { AuthActionButton };


export type ParamsPreserverLinkProps = React.ComponentProps<typeof Link> & {
  preserveParams?: boolean;
};

export function ParamsPreserverLink({
  href,
  preserveParams = false,
  ...props
}: ParamsPreserverLinkProps) {
  const searchParams = useSearchParams();
  const url = new URL(href.toString(), getWindowOrigin());
  if (preserveParams) url.search = searchParams.toString();

  return <Link href={url?.toString()} {...props} />;
}
