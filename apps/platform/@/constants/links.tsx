import { Settings, Sparkles, Tickets, Users } from "lucide-react";
import { BsInstagram } from "react-icons/bs";
import { FiLinkedin } from "react-icons/fi";
import { LuBookA, LuBuilding, LuGithub, LuSchool } from "react-icons/lu";
import { RiTwitterXFill } from "react-icons/ri";
import type { Session } from "~/auth/client";
// import { TbServer2 } from "react-icons/tb";

import { IoCalendarOutline } from "react-icons/io5";
import { TbDashboard } from "react-icons/tb";
import { ROLES, ROLES_ENUMS } from "~/constants";

import { AudioLines, CalendarRange } from "lucide-react";
import { BiSpreadsheet } from "react-icons/bi";
import { GrAnnounce, GrResources, GrSchedules } from "react-icons/gr";
import { MdOutlinePoll } from "react-icons/md";
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
};

export const quick_links: RouterCardLink[] = [
  {
    href: "/resources",
    title: "Resources",
    description: "Explore resources like articles, experiences, and more.",
    allowed_roles: ["*"],
    Icon: GrResources,
    category: "general",
  },
  {
    href: "/benefits",
    title: "Student Benefits",
    description: "Discover the benefits of Student email ID.",
    Icon: Sparkles,
    disabled: false,
    allowed_roles: ["*"],
    category: "general",
  },
  {
    href: "/results",
    title: "Results",
    description: "Check your results here.",
    allowed_roles: ["*"],
    Icon: BiSpreadsheet,
    category: "academic",
  },
  {
    href: "/syllabus",
    title: "Syllabus",
    description: "Check your syllabus here.",
    Icon: LuBookA,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/classroom-availability",
    title: "Classroom Availability",
    description: "Check the availability of classrooms here.",
    Icon: LuSchool,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/schedules",
    title: "Schedules",
    description: "Check your schedules here.",
    Icon: GrSchedules,
    disabled: false,
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/academic-calendar",
    title: "Academic Calendar",
    description: "Check the academic calender here.",
    Icon: CalendarRange,
    disabled: false,
    allowed_roles: ["*"],
    category: "academic",
  },

  {
    title: "Community",
    href: "/community",
    Icon: AudioLines,
    description: "Join the community and interact with your peers.",
    allowed_roles: ["*"],
    category: "community",
  },
  {
    title: "Announcements",
    href: "/announcements",
    Icon: GrAnnounce,
    description: "Check out the latest announcements.",
    allowed_roles: ["*"],
    category: "community",
  },
  {
    title: "Polls",
    href: "/polls",
    Icon: MdOutlinePoll,
    description: "Participate in polls.",
    allowed_roles: ["*"],
    category: "community",
  },
  // {
  //   href: "/chat",
  //   title: "Chatbot",
  //   description: "Chat with the college chatbot.(Beta)",
  //   Icon: Bot,
  //   disabled: true,
  //   allowed_roles: ["*"],
  // },
];

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

export const sidebar_links: rawLinkType[] = [
  {
    title: "Dashboard",
    icon: TbDashboard,
    path: "",
    allowed_roles: Object.values(ROLES),
    category: "none"
  },
  {
    title: "Users",
    icon: Users,
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
    title: "Result",
    icon: BiSpreadsheet,
    path: "/result",
    allowed_roles: [ROLES_ENUMS.ADMIN],
    category: "metrics",
    items: [
      {
        title: "Scraping",
        path: "/scraping",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
      {
        title: "Import from Excel",
        path: "/import",
        allowed_roles: [ROLES_ENUMS.ADMIN],
      },
    ],
  },

  {
    title: "Academic Events",
    icon: IoCalendarOutline,
    path: "/events",
    category: "view",
    allowed_roles: [ROLES_ENUMS.ADMIN],
  },
  {
    title: "Courses",
    icon: LuBookA,
    path: "/courses",
    category: "view",

    allowed_roles: [ROLES_ENUMS.ADMIN],
  },
  {
    title: "Schedules",
    icon: GrSchedules,
    path: "/schedules",
    category: "view",

    // make it regex
    allowed_roles: [
      ROLES_ENUMS.ADMIN,
      ROLES_ENUMS.FACULTY,
      ROLES_ENUMS.HOD,
      ROLES_ENUMS.CR,
    ],
  },
  {
    title: "Personal Attendance",
    icon: CalendarRange,
    path: "/attendance-personal",
    category: "view",

    allowed_roles: [ROLES_ENUMS.STUDENT],
  },
  {
    title: "Out Pass",
    icon: Tickets,
    path: "/outpass",
    category: "view",

    allowed_roles: [ROLES_ENUMS.STUDENT],
  },
  {
    title: "Rooms",
    icon: LuSchool,
    path: "/rooms",
    category: "view",

    allowed_roles: [ROLES_ENUMS.ADMIN],
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
    icon: LuBuilding,
    path: "/hostels",
    category: "view",

    allowed_roles: [
      ROLES_ENUMS.ADMIN,
      ROLES_ENUMS.CHIEF_WARDEN,
      ROLES_ENUMS.ASSISTANT_WARDEN,
      ROLES_ENUMS.WARDEN,
      ROLES_ENUMS.MMCA,
    ],
    items: [],
  },

  {
    title: "Settings",
    icon: Settings,
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
  const compiledLinks = linksByRole.map((link) => ({
    ...link,
  }));
  if (user) {
    if (user.other_roles?.length <= 1) {
      compiledLinks.push({
        title: "Settings",
        href: user.other_roles[0] + "/settings",
        description: "Manage your account settings.",
        Icon: Settings,
        category: "dashboard",
        allowed_roles: ["*"]
      })
    } else {
      compiledLinks.push({
        title: "Dashboard",
        href: "/" + user.other_roles[0],
        description: "Manage your account settings.",
        Icon: Settings,
        category: "dashboard",
        allowed_roles: ["*"],
      })
    }
  }
  return compiledLinks

};
