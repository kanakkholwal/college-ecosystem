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
    title: "Academic Management",
    description:
      "Access academic information, results, schedules, syllabus, and other student resources from one place.",
    position: "left",
  },
  {
    icon: Bell,
    title: "Notices & Updates",
    description:
      "Keep important announcements, notices, circulars, and campus updates within easy reach.",
    position: "left",
  },
  {
    icon: Users,
    title: "Student Community",
    description:
      "Connect with other students and stay involved with clubs, societies, activities, and campus life.",
    position: "left",
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: Calendar,
    title: "Schedules & Events",
    description:
      "Find academic schedules, campus events, activities, and important dates in one place.",
    position: "right",
  },
  {
    icon: FileText,
    title: "Resources",
    description:
      "Organize and access useful academic resources, documents, and information whenever you need them.",
    position: "right",
  },
  {
    icon: Building,
    title: "Campus Services",
    description:
      "Bring everyday campus services and information together through a single digital platform.",
    position: "right",
  },
];

export const featuresSectionContent = {
  left: leftFeatures,
  right: rightFeatures,
};

/**
 * Testimonials are intentionally kept empty until genuine
 * student/faculty feedback is available.
 */
export const testimonialsContent = [];