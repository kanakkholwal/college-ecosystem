
import {
  Bell,
  Building,
  Calendar,
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  position?: "left" | "right";
  cornerStyle?: string;
};

const leftFeatures: FeatureItem[] = [
  {
    icon: GraduationCap,
    title: "Academic Hub",
    description:
      "Access academic results, timetables, syllabi, and essential learning information through one connected campus portal.",
    position: "left",
  },
  {
    icon: Bell,
    title: "Notices & Announcements",
    description:
      "Stay informed about institute notices, academic updates, events, and important campus announcements.",
    position: "left",
  },
  {
    icon: Users,
    title: "Campus Community",
    description:
      "Discover student communities, clubs, activities, and opportunities to participate in campus life.",
    position: "left",
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: Calendar,
    title: "Timetables & Events",
    description:
      "Keep track of class schedules, academic dates, institute events, and upcoming activities.",
    position: "right",
  },
  {
    icon: FileText,
    title: "Academic Resources",
    description:
      "Find useful academic documents, course information, results, and student resources in one place.",
    position: "right",
  },
  {
    icon: Building,
    title: "Campus Services",
    description:
      "Explore campus facilities and services, including classroom availability and hostel-related services where enabled.",
    position: "right",
  },
];

export const featuresSectionContent = {
  left: leftFeatures,
  right: rightFeatures,
};

/**
 * Keep testimonials empty until genuine student or faculty feedback
 * is available and approved for publication.
 */
export const testimonialsContent = [];
