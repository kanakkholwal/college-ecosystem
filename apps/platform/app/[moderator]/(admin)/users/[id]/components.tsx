"use client";

import {
  EmptyNote,
  Panel,
  PanelTitle,
} from "@/components/application/dashboard/primitives";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Copy,
  Laptop,
  LogOut,
  Smartphone,
  Trash2,
  TriangleAlert,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import {
  type AdminSessionRow,
  revokeUserSessionById,
  updateUser,
} from "~/actions/dashboard.admin";
import { deleteUserResourcesById } from "~/actions/user.core";
import { authClient } from "~/auth/client";
import { genderSchema, ROLES } from "~/constants";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass";
import { roleLabel } from "../shared";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "not_specified", label: "Not specified" },
] as const;

const PRIMARY_ROLES = ["user", "admin"];

const IN_CHARGE_OPTIONS = Array.from(
  new Map(IN_CHARGES_EMAILS.map((entry) => [entry.email, entry])).values()
);

const formSchema = z.object({
  displayUsername: z.string().max(60, "Keep it under 60 characters"),
  department: z.string().min(1, "Choose a department"),
  hostelId: z.string(),
  gender: genderSchema,
  role: z.string().min(1),
  other_roles: z.array(z.string()),
  other_emails: z.array(z.string().email()),
});

type FormValues = z.infer<typeof formSchema>;

type EditableUser = FormValues & { id: string; name: string };

const NOT_SET = "not_specified";

function toValues(user: EditableUser): FormValues {
  return {
    displayUsername:
      user.displayUsername === NOT_SET ? "" : user.displayUsername,
    department: user.department,
    hostelId: user.hostelId || NOT_SET,
    gender: user.gender,
    role: user.role,
    other_roles: user.other_roles,
    other_emails: user.other_emails,
  };
}

function diff(before: string[], after: string[]) {
  return {
    added: after.filter((item) => !before.includes(item)),
    removed: before.filter((item) => !after.includes(item)),
  };
}

function withCurrent(options: string[], current: string) {
  return current && !options.includes(current)
    ? [current, ...options]
    : options;
}

export function UserAccessForm({
  user,
  hostels,
}: {
  user: EditableUser;
  hostels: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => toValues(user));
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [saving, startSaving] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: saved,
  });
  const dirty = form.formState.isDirty;

  const accessChanges = (values: FormValues) => {
    const lines: string[] = [];
    if (values.role !== saved.role) {
      lines.push(
        `Primary role changes from ${roleLabel(saved.role)} to ${roleLabel(values.role)}.`
      );
    }
    const roles = diff(saved.other_roles, values.other_roles);
    if (roles.added.length)
      lines.push(`Gains: ${roles.added.map(roleLabel).join(", ")}.`);
    if (roles.removed.length)
      lines.push(`Loses: ${roles.removed.map(roleLabel).join(", ")}.`);
    const emails = diff(saved.other_emails, values.other_emails);
    if (emails.added.length)
      lines.push(`Links in-charge email: ${emails.added.join(", ")}.`);
    if (emails.removed.length)
      lines.push(`Unlinks: ${emails.removed.join(", ")}.`);
    return lines;
  };

  const save = (values: FormValues) =>
    startSaving(async () => {
      const result = await updateUser(user.id, {
        ...values,
        displayUsername: values.displayUsername.trim() || NOT_SET,
      });
      if (!result) {
        toast.error("Changes weren't saved. Check your access and try again.");
        return;
      }
      setPendingValues(null);
      setSaved(values);
      form.reset(values);
      toast.success(`Saved changes to ${user.name}`);
      router.refresh();
    });

  const onSubmit = (values: FormValues) => {
    if (accessChanges(values).length > 0) setPendingValues(values);
    else save(values);
  };

  const changes = pendingValues ? accessChanges(pendingValues) : [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        aria-label={`Edit ${user.name}`}
      >
        <Panel as="section">
          <PanelTitle>Profile</PanelTitle>
          <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-2">
            <FormField
              control={form.control}
              name="displayUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Not set" {...field} />
                  </FormControl>
                  <FormDescription>Shown on their public profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {withCurrent(
                        DEPARTMENTS_LIST.map((d) => d.name),
                        saved.department
                      ).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hostelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a hostel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NOT_SET}>Not a resident</SelectItem>
                      {hostels.map((hostel) => (
                        <SelectItem key={hostel.id} value={hostel.id}>
                          {hostel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {hostels.length === 0
                      ? "Hostels couldn't load, so only Not a resident is available."
                      : "Also updates their hostel student record."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                      className="justify-start"
                      variant="outline"
                    >
                      {GENDERS.map((gender) => (
                        <ToggleGroupItem
                          key={gender.value}
                          value={gender.value}
                          className="h-10 px-3"
                        >
                          {field.value === gender.value && (
                            <Check aria-hidden="true" />
                          )}
                          {gender.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Panel>

        <Panel as="section">
          <PanelTitle>Access</PanelTitle>
          <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {withCurrent(PRIMARY_ROLES, saved.role).map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Admin can manage every user, including this page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="other_roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other roles</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value}
                      onValuesChange={field.onChange}
                      loop
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Add a role" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {ROLES.map((role) => (
                            <MultiSelectorItem key={role} value={role}>
                              {roleLabel(role)}
                            </MultiSelectorItem>
                          ))}
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>
                    Each role opens its own dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="other_emails"
              render={({ field }) => (
                <FormItem className="@2xl:col-span-2">
                  <FormLabel>Linked in-charge emails</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value}
                      onValuesChange={field.onChange}
                      loop
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Link an email" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {IN_CHARGE_OPTIONS.map((entry) => (
                            <MultiSelectorItem
                              key={entry.email}
                              value={entry.email}
                            >
                              {entry.email} ({roleLabel(entry.role)})
                            </MultiSelectorItem>
                          ))}
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>
                    A linked warden or administrator email gives this account
                    in-charge access to that hostel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className="mr-auto text-body text-muted-foreground" aria-live="polite">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <Button
            type="button"
            variant="ghost"
            disabled={!dirty || saving}
            onClick={() => form.reset(saved)}
          >
            Discard
          </Button>
          <Button type="submit" variant="primary" disabled={!dirty || saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={pendingValues !== null}
        onOpenChange={(open) => !open && !saving && setPendingValues(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-subheading font-medium">
              Change access for {user.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3 text-body text-muted-foreground">
                <ul className="flex list-disc flex-col gap-1 pl-5 text-foreground">
                  {changes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>
                  Dashboards and permissions follow within about a minute. Their
                  current sessions stay signed in.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button
              variant="primary"
              disabled={saving}
              onClick={() => pendingValues && save(pendingValues)}
            >
              {saving ? "Saving..." : "Change access"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}

function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  const browser =
    /Edg\//.test(userAgent)
      ? "Edge"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Browser";
  const os = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad/.test(userAgent)
      ? "iOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  return os ? `${browser} on ${os}` : browser;
}

export function UserSessions({
  userId,
  userName,
  initialSessions,
}: {
  userId: string;
  userName: string;
  initialSessions: AdminSessionRow[] | null;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [confirmAll, setConfirmAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const revoke = (sessionId: string) =>
    startTransition(async () => {
      setBusyId(sessionId);
      const ok = await revokeUserSessionById(userId, sessionId);
      setBusyId(null);
      if (!ok) {
        toast.error("Couldn't sign out that session");
        return;
      }
      setSessions((prev) => prev?.filter((s) => s.id !== sessionId) ?? null);
      toast.success("Session signed out");
    });

  const revokeAll = () =>
    startTransition(async () => {
      const { error } = await authClient.admin.revokeUserSessions({ userId });
      if (error) {
        toast.error(error.message || "Couldn't sign out all sessions");
        return;
      }
      setConfirmAll(false);
      setSessions([]);
      toast.success(`${userName} is signed out everywhere`);
    });

  const now = Date.now();

  return (
    <Panel as="section">
      <PanelTitle
        meta={
          sessions && sessions.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAll(true)}
              disabled={pending}
            >
              <LogOut aria-hidden="true" />
              Sign out everywhere
            </Button>
          ) : null
        }
      >
        Sessions
      </PanelTitle>

      {sessions === null ? (
        <div role="alert" className="flex items-start gap-3 text-body">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            Sessions couldn't load. Only the admin role can view them; refresh
            to try again.
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyNote
          title="No sessions"
          description={`${userName} isn't signed in on any device.`}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {sessions.map((session) => {
            const expired = new Date(session.expiresAt).getTime() < now;
            const mobile = /mobile|android|iphone/i.test(
              session.userAgent ?? ""
            );
            const Glyph = mobile ? Smartphone : Laptop;
            return (
              <li
                key={session.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
                  <Glyph className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-body font-medium text-foreground"
                    title={session.userAgent ?? undefined}
                  >
                    {deviceLabel(session.userAgent)}
                    {session.impersonated && (
                      <span className="ml-2 text-caption font-normal text-warning">
                        Impersonation
                      </span>
                    )}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {session.ipAddress && (
                      <span className="font-mono">{session.ipAddress} · </span>
                    )}
                    Signed in{" "}
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}{" "}
                    ·{" "}
                    <span className={expired ? "text-destructive" : undefined}>
                      {expired ? "Expired" : "Expires"}{" "}
                      {formatDistanceToNow(new Date(session.expiresAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => revoke(session.id)}
                  aria-label={`Sign out ${deviceLabel(session.userAgent)} session`}
                >
                  {busyId === session.id ? "Signing out..." : "Sign out"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog
        open={confirmAll}
        onOpenChange={(open) => !pending && setConfirmAll(open)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-subheading font-medium">
              Sign {userName} out everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body">
              All {sessions?.length ?? 0} sessions end. They can sign in again
              straight away; a page they already have open may keep working for
              up to a minute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={pending} onClick={revokeAll}>
              {pending ? "Signing out..." : "Sign out everywhere"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

export function UserAccountActions({
  target,
  isSelf,
  basePath,
}: {
  target: { id: string; name: string; role: string };
  isSelf: boolean;
  basePath: string;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"impersonate" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();
  const targetIsAdmin = target.role === "admin";

  const impersonate = () =>
    startTransition(async () => {
      const { error } = await authClient.admin.impersonateUser({
        userId: target.id,
      });
      if (error) {
        toast.error(error.message || "Couldn't start impersonating");
        return;
      }
      // Full load so every cached segment picks up the new session.
      window.location.assign("/dashboard");
    });

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteUserResourcesById(target.id);
      } catch {
        // Production builds mask server action errors, so the reason isn't available.
        toast.error("Couldn't delete this account. Refresh and try again.");
        return;
      }
      setDialog(null);
      toast.success(`Deleted ${target.name}'s account`);
      router.replace(basePath);
      router.refresh();
    });

  const impersonateNote = isSelf
    ? "This is your own account."
    : targetIsAdmin
      ? "Admin accounts can't be impersonated."
      : null;

  return (
    <Panel as="section">
      <PanelTitle>Account actions</PanelTitle>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-body text-muted-foreground">
            See the platform as {target.name} does, for up to an hour.
          </p>
          <Button
            variant="outline"
            disabled={Boolean(impersonateNote) || pending}
            onClick={() => setDialog("impersonate")}
          >
            <UserCog aria-hidden="true" />
            Impersonate
          </Button>
          {impersonateNote && (
            <p className="text-caption text-muted-foreground">
              {impersonateNote}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-body text-muted-foreground">
            Permanently remove this account and everything it created.
          </p>
          <Button
            variant="destructive"
            disabled={isSelf || pending}
            onClick={() => setDialog("delete")}
          >
            <Trash2 aria-hidden="true" />
            Delete account
          </Button>
          {isSelf && (
            <p className="text-caption text-muted-foreground">
              You can't delete your own account.
            </p>
          )}
        </div>
      </div>

      <AlertDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && !pending && setDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          {dialog === "impersonate" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-subheading font-medium">
                  Impersonate {target.name}?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-muted-foreground">
                    <li>You leave your admin session and act as this account.</li>
                    <li>
                      Anything you change, post or submit is recorded as{" "}
                      {target.name}.
                    </li>
                    <li>
                      It ends after an hour, or when you choose Stop
                      impersonating in the banner.
                    </li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                <Button variant="primary" disabled={pending} onClick={impersonate}>
                  {pending ? "Switching..." : `Impersonate ${target.name}`}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-subheading font-medium">
                  Delete {target.name}'s account?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-2 text-body text-muted-foreground">
                    <p>This can't be undone. It removes:</p>
                    <ul className="flex list-disc flex-col gap-1 pl-5">
                      <li>Their sign-in, sessions and linked accounts</li>
                      <li>Attendance records and classroom usage history</li>
                      <li>
                        Announcements, community posts, comments and polls
                        they created
                      </li>
                      <li>Their hostel student record</li>
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                <Button variant="destructive" disabled={pending} onClick={remove}>
                  {pending ? "Deleting..." : "Delete account"}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon_sm"
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(`Couldn't copy the ${label}`);
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </Button>
  );
}
