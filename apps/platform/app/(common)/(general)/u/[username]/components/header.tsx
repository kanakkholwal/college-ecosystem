import { initials } from "@/components/application/community/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/utils/link";
import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { Profile } from "../data";
import { CopyProfileLink } from "./copy-profile-link";

const joined = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function ProfileHeader({
  profile,
  settingsHref,
  manageHref,
  resultRollNo,
}: {
  profile: Profile;
  settingsHref?: string;
  manageHref?: string;
  resultRollNo: string | null;
}) {
  const joinedAt = new Date(profile.joinedAt);

  return (
    <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
      <div className="flex min-w-0 items-start gap-4">
        <Avatar className="size-16 border border-border md:size-20">
          {profile.image && (
            <AvatarImage
              src={profile.image}
              alt=""
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          )}
          <AvatarFallback className="font-heading text-subheading font-medium text-primary">
            {initials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-balance text-heading-sm font-medium text-foreground md:text-heading-lg">
            {profile.name}
          </h1>
          <p className="mt-1 truncate font-mono text-body text-muted-foreground">
            @{profile.username}
          </p>
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-body text-muted-foreground">
            {profile.roles.length > 0 && (
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span className="sr-only">Role: </span>
                {profile.roles.join(", ")}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <Building2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Department: </span>
              {profile.department}
            </li>
            {profile.classOf && (
              <li className="flex items-center gap-1.5">
                <GraduationCap className="size-4" aria-hidden="true" />
                Class of {profile.classOf}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Joined{" "}
              <time dateTime={profile.joinedAt}>{joined.format(joinedAt)}</time>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {resultRollNo && (
          <ButtonLink
            href={`/results/${resultRollNo}`}
            variant="outline"
            size="sm"
          >
            <BookOpen />
            Academic results
          </ButtonLink>
        )}
        <CopyProfileLink path={`/u/${profile.username}`} />
        {settingsHref && (
          <ButtonLink href={settingsHref} variant="default" size="sm">
            <Settings />
            Edit in settings
          </ButtonLink>
        )}
        {manageHref && (
          <ButtonLink href={manageHref} variant="default" size="sm">
            <ShieldCheck />
            Manage user
          </ButtonLink>
        )}
      </div>
    </header>
  );
}
