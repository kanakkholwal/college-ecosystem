import { DEPARTMENT_CODES } from "~/constants/core.departments";
import { Content } from "@tiptap/react";
import z from "zod";

export const CATEGORY_TYPES = [
  "academics",
  "departmental",
  "technology",
  "design",
  "activities",
  "others",
] as const;
export const SUB_CATEGORY_TYPES: readonly string[] = DEPARTMENT_CODES;

export const CATEGORY_IMAGES: Record<string, string> = {
  academics: "/assets/images/community.academics.png",
  departmental: "/assets/images/community.departmental.png",
  technology: "/assets/images/community.technology.png",
  design: "/assets/images/community.design.png",
  activities: "/assets/images/community.activities.png",
  others: "/assets/images/community.others.png",
};

export const CATEGORIES: {
  name: string;
  value: (typeof CATEGORY_TYPES)[number];
  image: string;
  description: string;
}[] = [
  {
    name: "Academics",
    value: "academics",
    image: CATEGORY_IMAGES.academics,
    description: "Explore academic communities",
  },
  {
    name: "Departmental",
    value: "departmental",
    image: CATEGORY_IMAGES.departmental,
    description: "Discover departmental communities",
  },
  {
    name: "Technology",
    value: "technology",
    image: CATEGORY_IMAGES.technology,
    description: "Join technology communities.",
  },
  {
    name: "Design",
    value: "design",
    image: CATEGORY_IMAGES.design,
    description: "Engage with design communities.",
  },
  {
    name: "Activities",
    value: "activities",
    image: CATEGORY_IMAGES.activities,
    description: "Communities on various activities and events.",
  },
  {
    name: "Others",
    value: "others",
    image: CATEGORY_IMAGES.others,
    description: "Explore other communities",
  },
];




export const rawCommunityPostSchema = z.object({
  title: z.string().min(5, "Title must be atleast 5 characters long."),
  content: z.string().min(10, "Content must be atleast 10 characters long."), // markdown
  content_json: z.custom<Content>(),
  category: z.enum(CATEGORY_TYPES),
  subCategory: z
    .enum(
      SUB_CATEGORY_TYPES as unknown as [
        (typeof SUB_CATEGORY_TYPES)[number],
        ...(typeof SUB_CATEGORY_TYPES)[number][],
      ]
    )
    .optional()
    .nullable(),
});

export type RawCommunityPostType = z.infer<typeof rawCommunityPostSchema>;