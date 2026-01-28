"use server";

import { getPostActivity } from "~/actions/common.community";
import { ActivityResponse, GetActivityParamters } from "./types";

export async function getActivity({ targetId, targetModel }: GetActivityParamters): Promise<ActivityResponse | null> {
    if (targetModel === "communityPost") {
        const activity = await getPostActivity(targetId)
        return {
            likedBy: {
                label: "Liked By",
                icon: "heart",
                iconColor: "text-red-500",
                data: activity.likedBy
            },
            savedBy: {
                label: "Saved By",
                icon: "bookmark",
                iconColor: "text-emerald-500",
                data: activity.savedBy
            }
        }
    }
    return null;
}