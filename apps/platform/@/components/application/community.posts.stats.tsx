import { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Bookmark, Heart } from "lucide-react"; // Assuming lucide-react for icons
import Link from "next/link";
import { getPostActivity } from "~/actions/common.community";

interface UserType {
    id: string;
    name: string;
    username: string;
    image: string | null;
}

function RenderUser({ user, action }: { user: UserType, action: "like" | "save" }) {
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
                    <Icon name={action === "like" ? "heart" : "bookmark"}
                        className={cn("size-3",
                            action === "like" ? "text-red-500" : "text-emerald-500"
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

function EmptyState({ label, icon: Icon }: { label: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
            <div className="p-3 bg-muted rounded-full">
                <Icon className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-sm">No {label} yet.</p>
        </div>
    );
}

export async function CommunityPostStats({ postId }: { postId: string }) {
    const { likedBy, savedBy } = await getPostActivity(postId);

    return (
        <ResponsiveDialog
            btnProps={{
                variant: "ghost",
                size: "icon_sm",
                title: "View Activity",
                children: <Icon name="activity" />
            }}
            hideHeader={true}
            title="Post Activity"
            description="People who interacted with this post."
            className="p-0"
        >
            <div className="text-left pt-4 pl-4">
                <h4 className="text-base text-foreground font-semibold">Post Activity</h4>
                <p className="text-sm text-muted-foreground">People who interacted with this post.</p>
            </div>
            <Tabs defaultValue="likedBy" className="w-full bg-card rounded-lg">

                <div className="px-4 pt-2">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="likedBy" className="gap-2">
                            <Icon name="heart" className="size-4 text-red-500" />
                            Likes <span className="text-xs opacity-60 ml-1">({likedBy.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="savedBy" className="gap-2">
                            <Icon name="bookmark" className="size-4 text-emerald-500" />

                            Saves <span className="text-xs opacity-60 ml-1">({savedBy.length})</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4">
                    <TabsContent value="likedBy">
                        <ScrollArea className="h-[300px] pr-4">
                            {likedBy.length > 0 ? (
                                <div className="space-y-1">
                                    {likedBy.map((user) => (
                                        <RenderUser user={user} key={user.id} action="like" />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState label="likes" icon={Heart} />
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="savedBy">
                        <ScrollArea className="h-[300px] pr-4">
                            {savedBy.length > 0 ? (
                                <div className="space-y-1">
                                    {savedBy.map((user) => (
                                        <RenderUser user={user} key={user.id} action="save" />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState label="saves" icon={Bookmark} />
                            )}
                        </ScrollArea>
                    </TabsContent>
                </div>

            </Tabs>
        </ResponsiveDialog>
    );
}