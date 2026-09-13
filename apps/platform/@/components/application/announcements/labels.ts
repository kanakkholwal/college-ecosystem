import type { RELATED_FOR_TYPES } from "~/constants/common.announcement";

export type AnnouncementCategory = (typeof RELATED_FOR_TYPES)[number];

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  academics: "Academics",
  events: "Events",
  culturalEvents: "Cultural",
  techEvents: "Tech",
  workshops: "Workshops",
  bloodDonation: "Blood donation",
  others: "Other",
};
