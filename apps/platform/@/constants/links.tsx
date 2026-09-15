import {
  PiBankDuotone,
  PiBedDuotone,
  PiBooksDuotone,
  PiBuildingsDuotone,
  PiCalendarCheckDuotone,
  PiCalendarDuotone,
  PiCalendarPlusDuotone,
  PiChalkboardTeacherDuotone,
  PiChartBarDuotone,
  PiChartLineUpDuotone, // CGPA/Merit Allotment
  PiClockCounterClockwiseDuotone,
  PiDoorDuotone, // History/Logs
  PiFileCsvDuotone,
  PiGearDuotone,
  PiGhostDuotone,
  PiGiftDuotone,
  PiMegaphoneDuotone,
  PiScrollDuotone,
  PiSquaresFourDuotone, // Bulk Import (Spreadsheet)
  PiStudentDuotone,
  PiTicketDuotone,
  PiUserCheckDuotone,
  PiUserListDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
// Brand Icons (Keep these as they are specific logos)
import { BsInstagram } from "react-icons/bs";
import { FiLinkedin } from "react-icons/fi";
import { LuGithub } from "react-icons/lu";
import { RiTwitterXFill } from "react-icons/ri";
import type { Session } from "~/auth/client";
import { ROLES, ROLES_ENUMS } from "~/constants";

import { appConfig, supportLinks } from "~/project.config";

export type AllowedRoleType =
  | Session["user"]["role"]
  | Session["user"]["other_roles"][number]
  | "*"
  | `!${Session["user"]["role"]}`
  | `!${Session["user"]["other_roles"][number]}`;

export type RouterCardLink = {
  href: string;
  title: string;
  description: string;
  external?: boolean;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  allowed_roles: AllowedRoleType[] | AllowedRoleType;
  disabled?: boolean;
  category: string;
  isNew?: boolean;
};
export type rawLinkType = {
  title: string;
  path: string;
  allowed_roles: AllowedRoleType[] | AllowedRoleType;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  preserveParams?: boolean;
  category: "none" | "metrics" | "action" | "view";
  items?: {
    title: string;
    path: string;
    allowed_roles: AllowedRoleType[] | AllowedRoleType;
  }[];
};
// --- Quick Links (Dashboard Home) ---
export const quick_links: RouterCardLink[] = [
  {
    href: "/benefits",
    title: "Student Benefits",
    description: "Exclusive deals via your Student ID.",
    Icon: PiGiftDuotone,
    allowed_roles: ["*"],
    category: "general",
    isNew: true,
  },
  {
    href: "/results",
    title: "Academic Results",
    description: "Performance analytics and semester grades.",
    allowed_roles: ["*"],
    Icon: PiChartLineUpDuotone,
    category: "academic",
  },
  {
    href: "/syllabus",
    title: "Syllabus",
    description: "Curriculum tracking and course structures.",
    Icon: PiScrollDuotone,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/classroom-availability",
    title: "Classroom Finder",
    description: "Live occupancy status of lecture halls.",
    Icon: PiChalkboardTeacherDuotone,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/schedules",
    title: "Time Tables",
    description: "Daily class schedules and faculty timings.",
    Icon: PiCalendarCheckDuotone,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/academic-calendar",
    title: "Academic Calendar",
    description: "Yearly schedule of exams and holidays.",
    Icon: PiCalendarDuotone,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    title: "Community",
    href: "/community",
    Icon: PiUsersThreeDuotone,
    description: "Connect with peers in discussion forums.",
    allowed_roles: ["*"],
    category: "community",
  },
  {
    title: "Announcements",
    href: "/announcements",
    Icon: PiMegaphoneDuotone,
    description: "Official news and campus updates.",
    allowed_roles: ["*"],
    category: "community",
  },
  {
    title: "Polls",
    href: "/polls",
    Icon: PiChartBarDuotone,
    description: "Vote on campus opinions and surveys.",
    allowed_roles: ["*"],
    category: "community",
  },
];

// --- Sidebar Navigation Links ---
export const sidebar_links: rawLinkType[] = [
  {
    title: "Dashboard",
    icon: PiSquaresFourDuotone,
    path: "",
    allowed_roles: Object.values(ROLES),
    category: "none",
  },
  {
    title: "User Management",
    icon: PiUserListDuotone,
    path: "/users",
    allowed_roles: [ROLES_ENUMS.ADMIN],
    category: "metrics",
    items: [
      {
        title: "Create User",
        path: "/new",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Results & Data",
    icon: PiBankDuotone, // Represents a data bank
    path: "/result",
    allowed_roles: [ROLES_ENUMS.ADMIN],
    category: "metrics",
    items: [
      {
        title: "Web Scraping",
        path: "/scraping",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
      {
        title: "Import Excel",
        path: "/import",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Events",
    icon: PiCalendarPlusDuotone,
    path: "/events",
    category: "view",
    allowed_roles: [ROLES_ENUMS.ADMIN],
    items: [
      {
        title: "Create Event",
        path: "/new",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Courses",
    icon: PiBooksDuotone,
    path: "/courses",
    category: "view",
    allowed_roles: [
      ROLES_ENUMS.ADMIN,
      ROLES_ENUMS.FACULTY,
      ROLES_ENUMS.HOD,
      ROLES_ENUMS.CR,
    ],
    items: [
      {
        title: "Create Course",
        path: "/create",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Schedules",
    icon: PiCalendarCheckDuotone,
    path: "/schedules",
    category: "view",
    allowed_roles: [
      ROLES_ENUMS.ADMIN,
      ROLES_ENUMS.FACULTY,
      ROLES_ENUMS.HOD,
      ROLES_ENUMS.CR,
    ],
    items: [
      {
        title: "Create Schedule",
        path: "/create",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Attendance",
    icon: PiUserCheckDuotone,
    path: "/attendance-personal",
    category: "view",
    allowed_roles: [ROLES_ENUMS.STUDENT],
  },
  {
    title: "Gate Pass",
    icon: PiTicketDuotone,
    path: "/outpass",
    category: "view",
    allowed_roles: [ROLES_ENUMS.STUDENT],
  },
  {
    title: "Facilities",
    icon: PiDoorDuotone,
    path: "/rooms",
    category: "view",
    allowed_roles: [
      ROLES_ENUMS.ADMIN,
      ROLES_ENUMS.FACULTY,
      ROLES_ENUMS.HOD,
      ROLES_ENUMS.CR,
    ],
    items: [
      {
        title: "Add Room",
        path: "/new",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },
  {
    title: "Hostels",
    icon: PiBuildingsDuotone,
    path: "/hostels",
    category: "view",
    allowed_roles: [ROLES_ENUMS.ADMIN, ROLES_ENUMS.CHIEF_WARDEN],
    items: [],
  },
  {
    title: "Settings",
    icon: PiGearDuotone,
    path: "/settings",
    category: "view",
    allowed_roles: Object.values(ROLES),
    items: [
      {
        title: "Account",
        path: "/account",
        allowed_roles: Object.values(ROLES),
      },
      {
        title: "Appearance",
        path: "/appearance",
        allowed_roles: Object.values(ROLES),
      },
    ],
  },
];

interface SocialLink {
  href: string;
  icon: React.ElementType;
}

export const socials: SocialLink[] = [
  {
    href: appConfig.socials.twitter,
    icon: RiTwitterXFill,
  },
  {
    href: appConfig.socials.linkedin,
    icon: FiLinkedin,
  },
  {
    href: appConfig.socials.github,
    icon: LuGithub,
  },
  {
    href: appConfig.socials.instagram,
    icon: BsInstagram,
  },
];

/**
 * Whether any of `roles` may see a link. `"*"` allows everyone and `"!role"` denies that role;
 * a list with only denials allows every other role.
 */
export const canAccessLink = (
  roles: string | readonly string[],
  allowed: AllowedRoleType | readonly AllowedRoleType[]
): boolean => {
  const held = (typeof roles === "string" ? [roles] : roles).filter(Boolean);
  const rules = (Array.isArray(allowed) ? allowed : [allowed]).map(String);
  const denied = rules.filter((r) => r.startsWith("!")).map((r) => r.slice(1));
  if (held.some((role) => denied.includes(role))) return false;
  if (rules.includes("*")) return true;
  const granted = rules.filter((r) => !r.startsWith("!"));
  if (granted.length === 0) return denied.length > 0;
  return held.some((role) => granted.includes(role));
};

export const getLinksByRole = <T extends rawLinkType | RouterCardLink>(
  role: string | readonly string[],
  links: T[]
): T[] => links.filter((link) => canAccessLink(role, link.allowed_roles));

export const SUPPORT_LINKS = supportLinks;

export type NavLink = RouterCardLink & {
  items?: NavLink[];
};

export const getNavLinks = (user?: Session["user"]): NavLink[] => {
  // With no roles (signed out), only links open to everyone pass.
  const roles = user ? [user.role, ...(user.other_roles ?? [])] : [];
  const linksByRole = getLinksByRole(roles, quick_links);

  if (user) {
    linksByRole.push({
      title: "Dashboard",
      href: "/" + user.other_roles[0],
      description: "Manage your account settings.",
      Icon: PiSquaresFourDuotone,
      category: "dashboard",
      allowed_roles: ["*"],
    });
    linksByRole.push({
      title: "Settings",
      href: user.other_roles[0] + "/settings",
      description: "Manage your account settings.",
      Icon: PiGearDuotone,
      category: "dashboard",
      allowed_roles: ["*"],
    });
  }

  return linksByRole;
};

export const getHostelRoutes = (moderator: string, slug: string) =>
  [
    {
      title: "Outpass Requests",
      description: "Approve or reject student exit requests.",
      href: `/${moderator}/h/${slug}/outpass-requests`,
      Icon: PiTicketDuotone,
    },
    {
      title: "Activity Logs",
      description: "View history of entry and exit movements.",
      href: `/${moderator}/h/${slug}/outpass-logs`,
      Icon: PiClockCounterClockwiseDuotone,
    },
    {
      title: "Hostelers Directory",
      description: "Manage student database and residents.",
      href: `/${moderator}/h/${slug}/students`,
      Icon: PiStudentDuotone,
    },
    {
      title: "Room Management",
      description: "View occupancy and room details.",
      href: `/${moderator}/h/${slug}/rooms`,
      Icon: PiBedDuotone,
    },
    {
      title: "CGPA Allotment",
      description: "Automated room allocation based on merit.",
      Icon: PiChartLineUpDuotone,
      href: `/${moderator}/h/${slug}/allotment`,
      disabled: true,
    },
    {
      title: "Bulk Import (Excel)",
      description: "Upload room allotment data via spreadsheet.",
      Icon: PiFileCsvDuotone,
      href: `/${moderator}/h/${slug}/allotment-by-excel`,
    },
  ] as RouterCardLink[];

const hostelAccessRoles = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.WARDEN,
  ROLES_ENUMS.MMCA,
];
type SideNavLink = {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
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
  // Create a shallow copy of the array to avoid mutating the original
  let sidebar_links_modified = [...sidebar_links];

  if (
    hostelAccessRoles.includes(role as (typeof hostelAccessRoles)[number]) &&
    hostelSlug
  ) {
    sidebar_links_modified.splice(-2, 0, {
      title: "Hostel Actions",
      icon: PiBuildingsDuotone,
      path: `/h/${hostelSlug}`,
      allowed_roles: hostelAccessRoles,
      category: "view",
      items: getHostelRoutes(role, hostelSlug).map((route) => ({
        title: route.title,
        path: route.href.replace(`/${role}/h/${hostelSlug}`, ""),
        allowed_roles: hostelAccessRoles,
        disabled: route?.disabled,
      })),
    });
  }

  // `role` is the dashboard segment, which the [moderator] layout has already checked the user holds.
  return sidebar_links_modified
    .filter((link) => canAccessLink(role, link.allowed_roles))
    .map((link) => ({
      title: link.title,
      icon: link.icon,
      href: prefixPath ? `/${prefixPath}${link.path}` : `/${role}${link.path}`,
      preserveParams: link?.preserveParams,
      items: link?.items
        ?.filter((item) => canAccessLink(role, item.allowed_roles))
        ?.map((item) => ({
          title: item.title,
          href: prefixPath
            ? `/${prefixPath}${link.path}${item.path}`
            : `/${role}${link.path}${item.path}`,
          disabled: "disabled" in item ? Boolean(item.disabled) : false,
        })),
    }));
};
