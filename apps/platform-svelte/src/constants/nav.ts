import { ROLES, ROLES_ENUMS } from "$constants";
import { appConfig } from "$lib/config/project";
import type { RawLinkType, RouterCardLink } from "$lib/types/nav";

export const quick_links: RouterCardLink[] = [
  {
    href: "/resources",
    title: "Resources",
    description: "Explore articles, guides, and past archives.",
    allowed_roles: ["*"],
    icon: "ph:book-open-text-duotone",
    category: "general",
  },
  {
    href: "/benefits",
    title: "Student Benefits",
    description: "Exclusive deals via your Student ID.",
    icon: "ph:gift-duotone",
    allowed_roles: ["*"],
    category: "general",
    isNew: true,
  },
  {
    href: "/results",
    title: "Academic Results",
    description: "Performance analytics and semester grades.",
    allowed_roles: ["*"],
    icon: "ph:chart-line-up-duotone",
    category: "academic",
  },
  {
    href: "/syllabus",
    title: "Syllabus",
    description: "Curriculum tracking and course structures.",
    icon: "ph:scroll-duotone",
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/classroom-availability",
    title: "Classroom Finder",
    description: "Live occupancy status of lecture halls.",
    icon: "ph:chalkboard-teacher-duotone",
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/schedules",
    title: "Time Tables",
    description: "Daily class schedules and faculty timings.",
    icon: "ph:calendar-check-duotone",
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    href: "/academic-calendar",
    title: "Academic Calendar",
    description: "Yearly schedule of exams and holidays.",
    icon: "ph:calendar-duotone",
    allowed_roles: ["*"],
    category: "academic",
  },
  {
    title: "Community",
    href: "/community",
    icon: "ph:users-three-duotone",
    description: "Connect with peers in discussion forums.",
    allowed_roles: ["*"],
    category: "community",
  },
];
export const sidebar_links: RawLinkType[] = [
  {
    title: "Dashboard",
    icon: "ph:squares-four-duotone",
    path: "",
    allowed_roles: Object.values(ROLES),
    category: "none",
  },
  {
    title: "User Management",
    icon: "ph:user-list-duotone",
    path: "/users",
    allowed_roles: [ROLES_ENUMS.ADMIN],
    category: "metrics",
  },
];
export const socials = [
  {
    href: appConfig.socials.twitter,
    icon: "ri:twitter-x-fill",
  },
  {
    href: appConfig.socials.linkedin,
    icon: "mdi:linkedin",
  },
  {
    href: appConfig.socials.github,
    icon: "mdi:github",
  },
  {
    href: appConfig.socials.instagram,
    icon: "mdi:instagram",
  },
];