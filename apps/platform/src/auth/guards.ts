import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { UserFacingError } from "~/lib/action-result";

// Mirrors app/[moderator]/(admin)/layout.tsx, which lets both roles in.
export const ADMIN_ROLES: readonly string[] = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.MODERATOR,
];

/** The request's session, deduped per render; throws if the lookup itself fails. */
export const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

export function isAdminLike(user: { role?: string | null } | null | undefined) {
  return !!user?.role && ADMIN_ROLES.includes(user.role);
}

export class UnauthorizedError extends UserFacingError {
  constructor(message = "You need an admin session to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function assertAdmin() {
  const session = await getCurrentSession();
  if (!session || !isAdminLike(session.user)) {
    throw new UnauthorizedError();
  }
  return session;
}
