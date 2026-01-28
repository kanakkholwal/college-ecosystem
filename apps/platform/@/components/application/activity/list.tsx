import { Icon, IconType } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { changeCase } from "~/utils/string";
import { getActivity } from "./actions";
import { ActivityType, GetActivityParamters } from "./types";

interface ActivityListProps extends GetActivityParamters { }

export async function ActivityList({ targetId, targetModel }: ActivityListProps) {
    const activity = await getActivity({ targetModel, targetId });
    if (!activity || Object.keys(activity).length === 0) return null;

    const keys = Object.keys(activity);

    return (
        <ResponsiveDialog
            btnProps={{
                variant: "ghost",
                size: "icon_sm",
                title: "View Activity",
                children: <Icon name="activity" />
            }}
            hideHeader={true}
            title={`${targetModel} Activity`}
            description={`People who interacted with this ${targetModel}.`}
            className="p-0"
        >
            <div className="text-left pt-4 pl-4">
                <h4 className="text-base text-foreground font-semibold">{changeCase(targetModel, "camel_to_title")} Activity</h4>
                <p className="text-sm text-muted-foreground">People who interacted with this {changeCase(targetModel, "camel_to_title")}.</p>
            </div>
            <Tabs defaultValue={keys[0]} className="w-full bg-card rounded-lg">

                <div className="px-4 pt-2">
                    <TabsList className="w-full grid grid-cols-2">
                        {keys.map((key) => {
                            const value = activity[key];
                            return (
                                <TabsTrigger value={key} className="gap-2" key={`activity-${key}-tab`}>
                                    <Icon name={value.icon} className={cn("size-4", value.iconColor)} />
                                    {changeCase(key, "camel_to_title")} <span className="text-xs opacity-60 ml-1">({value.data.length})</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>

                <div className="p-4">
                    {keys.map((key) => {
                        const value = activity[key];
                        return <TabsContent value={key} key={`activity-${key}-content`}>
                            <ScrollArea className="h-[300px] pr-4">
                                {value.data.length > 0 ? (
                                    <div className="space-y-1">
                                        {value.data.map((user) => (
                                            <RenderUser user={user} key={user.id} icon={value.icon} iconColor={value.iconColor} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState label="likes" icon={value.icon} iconColor={value.iconColor} />
                                )}
                            </ScrollArea>
                        </TabsContent>
                    })}

                </div>

            </Tabs>
        </ResponsiveDialog>
    );
}


function RenderUser({ user, icon, iconColor }: { user: ActivityType["data"][number], icon: IconType, iconColor?: string }) {
    return (
        <Link
            href={`/u/${user.username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group w-full"
        >
            <div className="relative">
                <Avatar className="size-10 border border-border">
                    <AvatarImage src={user.image || ""} alt={user.username} />
                    <AvatarFallback className="text-xs font-medium">
                        {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 translate-2 z-5 size-4">
                    <Icon name={icon}
                        className={cn("size-3",
                            iconColor
                        )} />
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                </p>
            </div>
        </Link>
    );
}

function EmptyState({ label, icon, iconColor }: {
    label: string,
    icon: IconType,
    iconColor?: string
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
            <div className="p-3 bg-muted rounded-full">
                <Icon name={icon} className={cn("size-6 opacity-50", iconColor)} />
            </div>
            <p className="text-sm">No {label} yet.</p>
        </div>
    );
}