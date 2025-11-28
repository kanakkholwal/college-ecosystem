import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Lock,
  Plus,
  ShieldCheck,
  Users
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { MdRoom } from "react-icons/md";
import { getHostels } from "~/actions/hostel.core";
import { auth } from "~/auth";
import type { HostelType } from "~/models/hostel_n_outpass";
import { CreateHostelForm, ImportFromSiteButton } from "./client";

export default async function ChiefWardenPage({
  params,
}: {
  params: Promise<{
    moderator: string;
  }>;
}) {
  const { moderator } = await params;
  const response = await getHostels();
  const { success, data: hostels } = response;
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return (
    <div className="space-y-8 my-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6">
      <HeaderBar
        Icon={MdRoom}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Hostel Directory</h1>
            <Badge variant="secondary" className="rounded-full px-2.5 bg-muted text-muted-foreground border-border">
              {hostels?.length || 0} Properties
            </Badge>
          </div>
        }
        descriptionNode="Manage campus housing, wardens, and room configurations across the ecosystem."
        actionNode={
          <div className="flex items-center gap-2">
            {hostels?.length === 0 && <ImportFromSiteButton />}
            <ResponsiveDialog
              title="Add New Hostel"
              description="Configure a new hostel block in the system."
              btnProps={{
                variant: "default",
                size: "sm",
                className: "gap-2 shadow-sm",
                children: (
                  <>
                    <Plus className="h-4 w-4" /> Add Hostel
                  </>
                ),
              }}
            >
              <CreateHostelForm />
            </ResponsiveDialog>
          </div>
        }
      />

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyArea
            icons={[AlertCircle]}
            title="System Error"
            description="Failed to load hostel data. Please check your network or permissions."
            className="border-destructive/50 bg-destructive/5 text-destructive"
          />
        }
        loadingFallback={<HostelGridSkeleton />}
      >
        <ConditionalRender condition={!!hostels && hostels.length > 0}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hostels?.map((hostel: any) => {
              // --- Access Control Logic ---
              const allowedEmails = hostel.administrators
                .map((elem: any) => elem.email)
                .concat([hostel.warden.email]);

              const userEmail = session?.user?.email;
              const userOtherEmails = session?.user?.other_emails || [];
              const isAdmin = session?.user.role === "admin";

              const isUserAllowed =
                isAdmin ||
                (userEmail && allowedEmails.includes(userEmail)) ||
                allowedEmails.some((email: string) => userOtherEmails.includes(email));

              return (
                <HostelCard
                  key={hostel.slug}
                  hostel={hostel}
                  href={`/${moderator}/hostels/${hostel.slug}`}
                  disabled={!isUserAllowed}
                />
              );
            })}
          </div>
        </ConditionalRender>

        <ConditionalRender condition={!hostels || hostels.length === 0}>
        
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No Hostels Configured</EmptyTitle>
              <EmptyDescription>
                Your campus housing ecosystem is empty. Start by adding your first hostel block.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ResponsiveDialog
                title="Add New Hostel"
                description="Configure a new hostel block."
                btnProps={{ children: "Create First Hostel" }}
              >
                <CreateHostelForm />
              </ResponsiveDialog>
            </EmptyContent>
          </Empty>
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: Hostel Card
// ----------------------------------------------------------------------

interface HostelCardProps {
  hostel: HostelType;
  href: string;
  disabled: boolean;
}

function HostelCard({ hostel, href, disabled }: HostelCardProps) {
  const isGirls = hostel.gender === "female";

  // Visual Theme Configuration based on Gender/Status
  // Using muted pastels for a modern, professional look rather than bright neon colors
  const theme = {
    iconBg: isGirls
      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    hoverBorder: isGirls
      ? "hover:border-rose-200 dark:hover:border-rose-800"
      : "hover:border-indigo-200 dark:hover:border-indigo-800",
    badge: isGirls
      ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300"
      : "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-300",
  };

  const CardWrapper = disabled ? "div" : Link;

  return (
    <CardWrapper
      href={href}
      className={cn(
        "group block h-full outline-none rounded-xl",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300 ease-in-out border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        disabled
          ? "bg-muted/10 opacity-80"
          : `hover:shadow-lg hover:-translate-y-1 bg-card ${theme.hoverBorder}`
      )}>

        {/* --- Header Section --- */}
        <CardHeader className="pb-3 space-y-4">
          <div className="flex justify-between items-start">
            {/* Icon Box */}
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-transparent",
              disabled ? "bg-muted text-muted-foreground border-border/50" : theme.iconBg
            )}>
              <Building2 className="h-6 w-6" strokeWidth={1.5} />
            </div>

            {/* Status / Lock Badge */}
            {disabled ? (
              <Badge variant="outline" className="gap-1.5 py-1 pl-1 pr-2.5 bg-muted text-muted-foreground border-border/60 shadow-sm">
                <div className="p-0.5 rounded-full bg-background">
                  <Lock className="h-3 w-3" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Restricted</span>
              </Badge>
            ) : (
              <Badge variant="outline" className={cn("capitalize font-medium shadow-sm", theme.badge)}>
                {hostel.gender} Hostel
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className={cn(
              "font-bold text-xl leading-tight tracking-tight transition-colors",
              !disabled && "group-hover:text-primary"
            )}>
              {hostel.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
              ID: {hostel.slug}
            </p>
          </div>
        </CardHeader>

        {/* --- Content Section --- */}
        <CardContent className="flex-1 pb-4">
          <div className="space-y-5">

            {/* Warden Info - Styled as an embedded contact card */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              disabled
                ? "bg-transparent border-dashed border-border/60"
                : "bg-muted/30 border-border/40 group-hover:bg-muted/50 group-hover:border-border/60"
            )}>
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src="" alt={hostel.warden.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {hostel.warden.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-0.5 overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Chief Warden
                </p>
                <p className="text-sm font-semibold truncate text-foreground">
                  {hostel.warden.name}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/30">
                <Users className="h-3.5 w-3.5 opacity-70" />
                <span>{hostel.administrators?.length || 0} Admins</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/30">
                <MdRoom className="h-3.5 w-3.5 opacity-70" />
                <span>View Rooms</span>
              </div>
            </div>

          </div>
        </CardContent>

        {/* --- Footer Action --- */}
        <CardFooter className="pt-0 pb-5">
          <Button
            variant={disabled ? "ghost" : "default"}
            className={cn(
              "w-full justify-between group/btn transition-all",
              disabled && "opacity-50 hover:bg-transparent"
            )}
            disabled={disabled}
          >
            <span className="font-semibold">{disabled ? "Access Denied" : "Manage Dashboard"}</span>
            {!disabled && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />}
          </Button>
        </CardFooter>

      </Card>
    </CardWrapper>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: Skeleton Loader
// ----------------------------------------------------------------------

function HostelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[380px] rounded-xl border bg-card p-6 space-y-6">
          <div className="flex justify-between items-start">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-md mt-auto" />
        </div>
      ))}
    </div>
  );
}