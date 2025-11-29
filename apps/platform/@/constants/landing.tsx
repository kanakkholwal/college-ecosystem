// Updated feature data arrays for College Ecosystem

import {
  Building,
  Calendar,
  FileText,
  GraduationCap,
  LucideIcon,
  MessageSquare,
  Users,
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
    icon: GraduationCap, // lucide-react
    title: "Academic Results",
    description:
      "Check your semester results instantly, ranked with CGPI and branch insights.",
    position: "left",
    cornerStyle: "sm:translate-x-4 sm:rounded-br-[2px]",
  },
  {
    icon: Building, // lucide-react
    title: "Hostel Allotment",
    description:
      "Seamless hostel room allocation with preferences, CGPI priority, and SOE-based rules.",
    position: "left",
    cornerStyle: "sm:-translate-x-4 sm:rounded-br-[2px]",
  },
  {
    icon: Users, // lucide-react
    title: "Clubs & Societies",
    description:
      "Explore cultural, technical, and sports clubs — join events and grow your community.",
    position: "left",
    cornerStyle: "sm:translate-x-4 sm:rounded-tr-[2px]",
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: Calendar, // lucide-react
    title: "Events & Activities",
    description:
      "Stay updated with college fests, workshops, and society events — all in one place.",
    position: "right",
    cornerStyle: "sm:-translate-x-4 sm:rounded-bl-[2px]",
  },
  {
    icon: FileText, // lucide-react
    title: "Resources & Notices",
    description:
      "Get access to study material, academic notices, and important circulars easily.",
    position: "right",
    cornerStyle: "sm:translate-x-4 sm:rounded-bl-[2px]",
  },
  {
    icon: MessageSquare, // lucide-react
    title: "Community Space",
    description:
      "Engage with peers, share ideas, and collaborate through dedicated student forums.",
    position: "right",
    cornerStyle: "sm:-translate-x-4 sm:rounded-tl-[2px]",
  },
];

export const featuresSectionContent = {
  left: leftFeatures,
  right: rightFeatures,
};

export const testimonialsContent = [
  {
    description: "Everything I need is just here.",
    image: "https://i.pravatar.cc/150?img=11",
    name: "Ankit Sharma",
    handle: "@19122",
  },
  {
    description: "This platform makes campus life smoother and more connected.",
    image: "https://i.pravatar.cc/150?img=22",
    name: "Ujjwal Singh",
    handle: "@19147",
  },
  {
    description:
      "From results to Syllabus, this platform actually makes NITH life simpler.",
    image: "https://i.pravatar.cc/150?img=33",
    name: "Rahul Mehta",
    handle: "@19089",
  },
  {
    description: "The UI is modern and simple to use. I love the features!",
    image: "https://i.pravatar.cc/150?img=44",
    name: "Ayushi Yadav",
    handle: "@19201",
  },
  {
    description:
      "The College Ecosystem really bridges academics and social life at NITH. ",
    image: "https://i.pravatar.cc/150?img=55",
    name: "Aditya Verma",
    handle: "@19057",
  },
];
