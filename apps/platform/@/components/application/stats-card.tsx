import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type StatsCardProps = {
  title: string;
  children: React.ReactNode;
  Icon?: React.ReactNode;
};

export function StatsCard({ title, children, Icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}
