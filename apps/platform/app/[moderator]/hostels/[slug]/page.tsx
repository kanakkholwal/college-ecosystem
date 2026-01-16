import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { RouterCard } from "@/components/common/router-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getHostelRoutes } from "@/constants/links";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ShieldCheck,
  Users
} from "lucide-react";
import { LuBuilding } from "react-icons/lu";
import { getHostel } from "~/actions/hostel.core";

export default async function HostelPage({
  params,
}: {
  params: Promise<{
    moderator: string;
    slug: string;
  }>;
}) {
  const { slug, moderator } = await params;
  const response = await getHostel(slug);
  const { success, hostel } = response;

  if (!success || !hostel) {
    return (
      <EmptyArea
        icons={[LuBuilding]}
        title="No Hostel Found"
        description={`Hostel with slug "${slug}" could not be found in the database.`}
        className="mt-10"
      />
    );
  }

  // Helper for Gender styling
  const isGirlsHostel = hostel.gender === "female";
  const genderTheme = isGirlsHostel
    ? "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900"
    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";

  return (
    <div className="space-y-8 my-6">
      
      {/* --- 1. Hero / Info Section --- */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <LuBuilding className="h-8 w-8 text-primary" />
              {hostel.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {hostel.slug.toUpperCase()}
              </span>
              <span>•</span>
              <span className="text-sm">Hostel Management Dashboard</span>
            </p>
          </div>
          <Badge variant="outline" className={cn("px-3 py-1 text-sm capitalize w-fit", genderTheme)}>
            {hostel.gender} Hostel
          </Badge>
        </div>

        {/* Management Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Warden Card */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Warden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src="" /> {/* Add avatar URL if available */}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {hostel.warden.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="font-semibold truncate" title={hostel.warden.name}>
                    {hostel.warden.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={hostel.warden.email}>
                    {hostel.warden.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrators Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" /> Administration Team ({hostel.administrators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hostel.administrators.map((admin) => (
                  <div key={admin.email} className="flex items-center gap-2.5 bg-muted/30 p-2 rounded-lg border border-border/50">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {admin.name.charAt(0)}
                       </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{admin.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate opacity-80">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* --- 2. Quick Actions Grid --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          Operational Modules
        </h3>
        
        <ResponsiveContainer>
          {getHostelRoutes(moderator, slug).map((route) => (
            <RouterCard
              key={route.href}
              Icon={route.Icon}
              title={route.title}
              description={route.description}
              href={route.href}
              disabled={route?.disabled}
            />
          ))}
        </ResponsiveContainer>
      </div>

    </div>
  );
}

