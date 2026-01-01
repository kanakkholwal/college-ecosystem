import { z } from "zod";

export const placementStorySchema = z.object({

    author: z.object({
        id: z.string(),
        name: z.string().min(2),
        username: z.string().min(2),
    }),
    // Company Details
    companyName: z.string().min(2, "Company name is required"),
    role: z.string().min(2, "Role is required (e.g. SDE-1)"),
    offerType: z.enum(["Internship", "FTE", "PPO", "Intern+FTE", "Other"]),
    location: z.string().optional(),
    ctc: z.string().optional(), // e.g., "12 LPA" or "50k/mo" (Keep string for flexibility)

    // The Experience
    selectionProcess: z.string().min(50, "Please describe the rounds in detail"),
    preparationStrategy: z.string().min(50, "How did you prepare?"),
    resources: z.array(z.object({
        title: z.string(),
        url: z.string().url()
    })).optional(),

    // Admin Flags
    isVerified: z.boolean().default(false),
});

export type PlacementStoryInput = z.infer<typeof placementStorySchema>;
