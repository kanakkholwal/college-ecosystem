import { ExternalLink, Settings, Tickets, Users } from "lucide-react";
import { BsInstagram } from "react-icons/bs";
import { FiLinkedin } from "react-icons/fi";
import { LuBookA, LuBuilding, LuGithub, LuSchool } from "react-icons/lu";
import { RiCustomSize, RiTwitterXFill } from "react-icons/ri";
import type { Session } from "~/lib/auth-client";
// import { TbServer2 } from "react-icons/tb";

import { IoCalendarOutline } from "react-icons/io5";
import { TbDashboard } from "react-icons/tb";
import { ROLES } from "~/constants";

import { AudioLines, CalendarRange } from "lucide-react";
import { BiSpreadsheet } from "react-icons/bi";
import { FaPeopleGroup } from "react-icons/fa6";
import { GrAnnounce, GrResources, GrSchedules } from "react-icons/gr";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdEmojiEvents, MdOutlinePoll } from "react-icons/md";
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
};

export const quick_links: RouterCardLink[] = [
  {
    href: "/resources",
    title: "Resources",
    description: "Explore resources like articles, experiences, and more.",
    allowed_roles: ["*"],
    Icon: GrResources,
  },
  {
    href: "/results",
    title: "Results",
    description: "Check your results here.",
    allowed_roles: ["*"],
    Icon: BiSpreadsheet,
  },
  {
    href: "/syllabus",
    title: "Syllabus",
    description: "Check your syllabus here.",
    Icon: LuBookA,
    allowed_roles: ["*"],
  },
  {
    href: "/classroom-availability",
    title: "Classroom Availability",
    description: "Check the availability of classrooms here.",
    Icon: LuSchool,
    allowed_roles: ["*"],
  },
  {
    href: "/schedules",
    title: "Schedules",
    description: "Check your schedules here.",
    Icon: GrSchedules,
    disabled: false,
    allowed_roles: ["*"],
  },
  {
    href: "/academic-calendar",
    title: "Academic Calendar",
    description: "Check the academic calender here.",
    Icon: CalendarRange,
    disabled: false,
    allowed_roles: ["*"],
  },
  {
    title: "Community",
    href: "/community",
    Icon: AudioLines,
    description: "Join the community and interact with your peers.",
    allowed_roles: ["*"],
  },
  {
    title: "Announcements",
    href: "/announcements",
    Icon: GrAnnounce,
    description: "Check out the latest announcements.",
    allowed_roles: ["*"],
  },
  {
    title: "Polls",
    href: "/polls",
    Icon: MdOutlinePoll,
    description: "Participate in polls.",
    allowed_roles: ["*"],
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
  },
  {
    title: "Users",
    icon: Users,
    path: "/users",
    allowed_roles: [ROLES.ADMIN],
    items: [
      {
        title: "Create User",
        path: "/new",
        allowed_roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    title: "Result",
    icon: BiSpreadsheet,
    path: "/result",
    allowed_roles: [ROLES.ADMIN],
    items: [
      {
        title: "Scraping",
        path: "/scraping",
        allowed_roles: [ROLES.ADMIN],
      },
      {
        title: "Import from Excel",
        path: "/import",
        allowed_roles: [ROLES.ADMIN],
      },
    ],
  },

  {
    title: "Academic Events",
    icon: IoCalendarOutline,
    path: "/events",
    allowed_roles: [ROLES.ADMIN],
  },
  {
    title: "Courses",
    icon: LuBookA,
    path: "/courses",
    allowed_roles: [ROLES.ADMIN],
  },
  {
    title: "Schedules",
    icon: GrSchedules,
    path: "/schedules",
    // make it regex
    allowed_roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.HOD, ROLES.CR],
  },
  {
    title: "Personal Attendance",
    icon: CalendarRange,
    path: "/attendance-personal",
    allowed_roles: [ROLES.STUDENT],
  },
  {
    title: "Out Pass",
    icon: Tickets,
    path: "/outpass",
    allowed_roles: [ROLES.STUDENT],
  },
  {
    title: "Rooms",
    icon: LuSchool,
    path: "/rooms",
    allowed_roles: [ROLES.ADMIN],
    items: [
      {
        title: "Add Room",
        path: "/new",
        allowed_roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    title: "Clubs",
    icon: HiOutlineUserGroup,
    path: "/clubs",
    allowed_roles: [ROLES.ADMIN],
    items: [],
  },
  {
    title: "Hostels",
    icon: LuBuilding,
    path: "/hostels",
    allowed_roles: [
      ROLES.ADMIN,
      ROLES.CHIEF_WARDEN,
      ROLES.ASSISTANT_WARDEN,
      ROLES.WARDEN,
      ROLES.MMCA,
    ],
    items: [],
  },

  {
    title: "Dashboard",
    icon: TbDashboard,
    path: "/dashboard",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "Members",
    icon: FaPeopleGroup,
    path: "/members",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "Events",
    icon: MdEmojiEvents,
    path: "/events",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "UI Customizer",
    icon: RiCustomSize,
    path: "/customizer",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "Go to Site",
    icon: ExternalLink,
    path: "",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    allowed_roles: ["club"],
    items: [],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
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
    ? roles.map((role) => String(role))
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
  return !allowedRoles.some(
    (roles) => toRegex(roles).test(userRole)
  );
};

export const SUPPORT_LINKS = supportLinks;

export type NavLink = {
  title: string;
  href: string;
  description: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
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

  return [
    // {
    //   title: "Home",
    //   href: "/",
    //   description: "Go to the home page.",
    //   Icon: House,
    // },
    ...linksByRole,
    ...(user ? user.other_roles?.length <= 1
      ? [
        {
          title: "Settings",
          href: user.other_roles[0] + "/settings",
          description: "Manage your account settings.",
          Icon: Settings,
        },
      ]
      : [
        {
          title: "Dashboard",
          href: "/" + user.other_roles[0],
          description: "Manage your account settings.",
          Icon: Settings,
          items: user.other_roles.map((role) => ({
            title:
              role.charAt(0).toUpperCase() + role.slice(1) + " Dashboard",
            href: `/${role}`,
            description: `Manage your ${role} dashboard.`,
            Icon: Settings,
          })),
        },
      ] : []),
  ];
};
