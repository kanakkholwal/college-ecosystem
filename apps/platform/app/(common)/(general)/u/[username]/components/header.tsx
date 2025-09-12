import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Calendar,
  Edit3,
  FolderOpen,
  Mail,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { getAcademicYear, isValidRollNumber } from "~/constants";
import { UserType } from "~/db/schema/auth-schema";
import { orgConfig } from "~/project.config";
import { changeCase } from "~/utils/string";

interface ProfileHeaderProps {
  user: UserType;
  authenticated?: boolean;
  isCurrentUser?: boolean;
}
export function ProfileHeader({
  user,
  authenticated,
  isCurrentUser,
}: ProfileHeaderProps) {
  const stats = [
    { label: "Projects", value: 0, icon: FolderOpen },
    { label: "Connections", value: 0, icon: Users },
    { label: "Contributions", value: 0, icon: Award },
    { label: "Rating", value: 0, icon: Star },
  ];

  return (
    <Card className="relative overflow-hidden bg-card/50 border-border backdrop-blur-sm">
      {/* Cover Image */}
      <div
        className="h-48 bg-gradient-to-r from-primary via-secondary to-indigo-600 relative"
        style={{
          backgroundImage: `url("/assets/images/profile-cover.webp")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      <CardContent className="relative -mt-16 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center lg:items-start">
            <Avatar className="h-32 w-32 border-4 border-border shadow-2xl">
              <AvatarImage
                src={
                  user.image
                    ? user.image
                    : `https://api.dicebear.com/5.x/initials/svg?seed=${user.name}`
                }
                alt={user.name}
              />
              <AvatarFallback className="text-2xl bg-primary">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {user.name}
              </h1>
              <p className="text-primary font-medium mb-2">@{user.username}</p>
              <p className="text-muted-foreground text-base mb-3">
                {user.department}{" "}
                {isValidRollNumber(user.username)
                  ? `- ${getAcademicYear(user.username).label}`
                  : null}
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                {user.other_roles.map((role: string, index: number) => (
                  <Badge key={index} variant="default_light">
                    {changeCase(role, "title")}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {authenticated
                      ? user.hostelId
                        ? changeCase(user.hostelId.replace("_", " "), "title") +
                          ", "
                        : null
                      : null}
                    {orgConfig.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>
                    {authenticated ? user.email : "Email hidden for privacy"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Action Buttons */}
            <div className="flex justify-center lg:justify-end gap-3 mb-6 lg:mt-20">
              <Button variant="rainbow_outline" size="sm" transition="damped">
                <Edit3 />
                Edit Profile
              </Button>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card/70 rounded-lg p-4 text-center border border-border/75 hover:border-primary/50 transition-colors"
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">
                    {typeof stat.value === "number" && stat.value % 1 !== 0
                      ? stat.value.toFixed(1)
                      : stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
