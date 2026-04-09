import { ROLES, ROLES_ENUMS } from "$constants";
import { quick_links, sidebar_links } from "$constants/nav";
import { supportLinks } from "$lib/config/project";
import type { AllowedRoleType, RawLinkType, RouterCardLink } from "$lib/types/nav";
import type { Session } from "$lib/types/session";
import { toRegex } from "$lib/utils/string";

export const getLinksByRole = <T extends RawLinkType | RouterCardLink>(
  role: string,
  links: T[]
): T[] => {
  return links.filter((link) =>
    checkRoleAccess(role, normalizeRoles(link.allowed_roles))
  );
};
// Helper function to normalize allowed_roles to array
const normalizeRoles = (
  roles: AllowedRoleType | AllowedRoleType[]
): string[] => {
  return Array.isArray(roles)
    ? ROLES.map((role) => String(role))
    : [String(roles)];
};
// Helper function to check role access with negation support
const checkRoleAccess = (userRole: string, allowedRoles: string[]): boolean => {
  // If allowed_roles is "*", allow access to everyone
  if (allowedRoles.includes("*")) return true;

  // Check for direct role match
  if (allowedRoles.includes(userRole)) return true;

  // Check for negation roles (starting with "!")
  // const positiveRoles = allowedRoles.filter((role) => !role.startsWith("!"));
  // const negatedRoles = allowedRoles.filter((role) => role.startsWith("!"));

  // // If there are positive roles specified, use standard inclusion logic
  // if (positiveRoles.length > 0) {
  //   return positiveRoles.includes(userRole);
  // }

  // If only negation roles are specified, allow access if user's role is not negated
  return !allowedRoles.some((roles) => toRegex(roles).test(userRole));
};

export const SUPPORT_LINKS = supportLinks;

export type NavLink = RouterCardLink & {
  items?: NavLink[];
};

export const getNavLinks = (user?: Session["user"]): NavLink[] => {
  // No user → public links only
  if (!user) {
    return dedupeLinks(getLinksByRole("*", quick_links));
  }

  const roles = [user.role, ...(user.other_roles ?? [])];

  // ✅ correct: filter per role
  const linksByRole = roles
    .flatMap((role) => getLinksByRole(role, quick_links))
    .filter(uniqueByHrefAndTitle);

  // ✅ dashboard links (iconify)
  linksByRole.push({
    title: "Dashboard",
    href: `/${roles[0]}`,
    description: "Manage your account settings.",
    icon: "ph:squares-four-duotone",
    category: "dashboard",
    allowed_roles: ["*"],
  });

  linksByRole.push({
    title: "Settings",
    href: `/${roles[0]}/settings`,
    description: "Manage your account settings.",
    icon: "ph:gear-duotone",
    category: "dashboard",
    allowed_roles: ["*"],
  });

  // ✅ ensure Whisper Room exists
  if (!linksByRole.some((l) => l.title === "Whisper Room")) {
    linksByRole.push({
      title: "Whisper Room",
      href: "/whisper-room",
      description: "Anonymous discussion forum for students.",
      icon: "ph:ghost-duotone",
      category: "community",
      allowed_roles: ["student"],
      isNew: true,
    });
  }

  return linksByRole;
};
const uniqueByHrefAndTitle = (
  link: NavLink,
  index: number,
  self: NavLink[]
) =>
  index ===
  self.findIndex(
    (l) => l.href === link.href && l.title === link.title
  );

const dedupeLinks = (links: NavLink[]) =>
  links.filter(uniqueByHrefAndTitle);



export const getHostelRoutes = (
  moderator: string,
  slug: string
): RouterCardLink[] => {
  const base = `/${moderator}/h/${slug}`;

  return [
    {
      title: "Outpass Requests",
      description: "Approve or reject student exit requests.",
      href: `${base}/outpass-requests`,
      icon: "ph:ticket-duotone",
      allowed_roles: ["*"],
      category: "hostel",
    },
    {
      title: "Activity Logs",
      description: "View history of entry and exit movements.",
      href: `${base}/outpass-logs`,
      icon: "ph:clock-counter-clockwise-duotone",
      allowed_roles: ["*"],
      category: "hostel",
    },
    {
      title: "Hostelers Directory",
      description: "Manage student database and residents.",
      href: `${base}/students`,
      icon: "ph:student-duotone",
      allowed_roles: ["*"],
      category: "hostel",
    },
    {
      title: "Room Management",
      description: "View occupancy and room details.",
      href: `${base}/rooms`,
      icon: "ph:bed-duotone",
      allowed_roles: ["*"],
      category: "hostel",
    },
    {
      title: "CGPA Allotment",
      description: "Automated room allocation based on merit.",
      href: `${base}/allotment`,
      icon: "ph:chart-line-up-duotone",
      allowed_roles: ["*"],
      category: "hostel",
      disabled: true,
    },
    {
      title: "Bulk Import (Excel)",
      description: "Upload room allotment data via spreadsheet.",
      href: `${base}/allotment-by-excel`,
      icon: "ph:file-csv-duotone",
      allowed_roles: ["*"],
      category: "hostel",
    },
  ];
};
const hostelAccessRoles = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.WARDEN,
  ROLES_ENUMS.MMCA,
];

export type SideNavLink =  {
  title: string;
  icon: string; // iconify
  href: string;
  preserveParams?: boolean;
  items?: {
    title: string;
    href: string;
    disabled?: boolean;
  }[];
};

export const getSideNavLinks = (
  role: string,
  prefixPath?: string,
  hostelSlug?: string | null
): SideNavLink[] => {
  const basePath = prefixPath ? `/${prefixPath}` : `/${role}`;

  // ✅ no mutation
  const links = [...sidebar_links];

  // ✅ inject hostel section safely
  if (
    hostelSlug &&
    hostelAccessRoles.includes(role as any)
  ) {
    links.push({
      title: "Hostel Actions",
      icon: "ph:buildings-duotone",
      path: `/h/${hostelSlug}`,
      allowed_roles: hostelAccessRoles,
      category: "view",
      items: getHostelRoutes(role, hostelSlug).map((route) => ({
        title: route.title,
        path: route.href.replace(`/${role}/h/${hostelSlug}`, ""),
        allowed_roles: hostelAccessRoles,
        disabled: route.disabled,
      })),
    });
  }

  return links
    .filter((link) =>
      checkRoleAccess(role, normalizeRoles(link.allowed_roles))
    )
    .map((link) => ({
      title: link.title,
      icon: link.icon, // ✅ already iconify
      href: `${basePath}${link.path}`,
      preserveParams: link.preserveParams,

      items: link.items
        ?.filter((item) =>
          checkRoleAccess(role, normalizeRoles(item.allowed_roles))
        )
        .map((item) => ({
          title: item.title,
          href: `${basePath}${link.path}${item.path}`,
          disabled: item.disabled,
        })),
    }));
};
