
export interface UserType {
    id: string;
    name: string;
    username: string;
    image: string | null;
}
export interface LikeActivity {
    icon: "heart";
    iconColor: "text-red-500";
}
export interface SaveActivity {
    icon: "bookmark";
    iconColor: "text-emerald-500";
}

export type ActivityType = (LikeActivity | SaveActivity) & {
    label: string;
    data: UserType[];
};

export type ActivityResponse = Record<string, ActivityType>;

export type GetActivityParamters = {
    targetModel: "communityPost" | "comment";
    targetId: string;
}