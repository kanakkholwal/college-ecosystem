import {
  PiBankDuotone,
  PiBedDuotone,
  PiBookOpenTextDuotone,
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
  PiUsersThreeDuotone
} from "react-icons/pi";
// Brand Icons (Keep these as they are specific logos)
import { BsInstagram } from "react-icons/bs";
import { FiLinkedin } from "react-icons/fi";
import { LuGithub } from "react-icons/lu";
import { RiTwitterXFill } from "react-icons/ri";
import type { Session } from "~/auth/client";
import { ROLES, ROLES_ENUMS } from "~/constants";

import { appConfig, supportLinks } from "~/project.config";
import { toRegex } from "~/utils/string";

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
  category: "none" | "metrics" | "action" | "view"
  items?: {
    title: string;
    path: string;
    allowed_roles: AllowedRoleType[] | AllowedRoleType;
  }[];
};
// --- Quick Links (Dashboard Home) ---
export const quick_links: RouterCardLink[] = [
  {
    href: "/resources",
    title: "Resources",
    description: "Explore articles, guides, and past archives.",
    allowed_roles: ["*"],
    Icon: PiBookOpenTextDuotone,
    category: "general",
  },
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
  {
    title: "Whisper Room",
    href: "/whisper-room",
    description: "Anonymous confessions and thoughts.",
    Icon: PiGhostDuotone,
    category: "community",
    allowed_roles: ["student"],
    isNew: true,
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
        path: "/create",
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

export const getLinksByRole = <T extends rawLinkType | RouterCardLink>(
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
  const linksByRole = [user?.role, ...(user?.other_roles || [])]
    .map((role) => getLinksByRole("*", quick_links))
    .flat() // filter out unique links
    .filter(
      (link, index, self) =>
        index ===
        self.findIndex((l) => l.href === link.href && l.title === link.title)
    );
  // console.log("Links by role:", linksByRole);

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
  // if(process.env.NODE_ENV !== "production"){
if (!linksByRole.some(l => l.title === "Whisper Room")) {
      linksByRole.push({
        title: "Whisper Room",
        href: "/whisper-room",
        description: "Anonymous discussion forum for students.",
        Icon: PiGhostDuotone,
        category: "community",
        allowed_roles: ["student"],
        isNew: true
      });
  }
  // }
  return linksByRole

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
]
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
}
export const getSideNavLinks = (role: string, prefixPath?: string, hostelSlug?: string | null): SideNavLink[] => {
  // Create a shallow copy of the array to avoid mutating the original
  let sidebar_links_modified = [...sidebar_links];

  if (hostelAccessRoles.includes(role as typeof hostelAccessRoles[number]) && hostelSlug) {
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
    })
  }

  return sidebar_links_modified
    .filter(
      (link) =>
        link.allowed_roles.includes(role) || link.allowed_roles.includes("*")
    )
    .map((link) => ({
      title: link.title,
      icon: link.icon,
      href: prefixPath ? `/${prefixPath}${link.path}` : `/${role}${link.path}`,
      preserveParams: link?.preserveParams,
      items: link?.items
        ?.filter(
          (link) =>
            link.allowed_roles.includes(role) ||
            link.allowed_roles.includes("*")
        )
        ?.map((item) => ({
          title: item.title,
          href: prefixPath
            ? `/${prefixPath}${link.path}${item.path}`
            : `/${role}${link.path}${item.path}`,
          disabled: true,
        })),
    }));
};