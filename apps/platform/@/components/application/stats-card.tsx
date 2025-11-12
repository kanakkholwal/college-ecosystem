import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { MagicCard } from "../animation/magic-card";

export type StatsCardProps = {
  title: string;
  children: React.ReactNode;
  Icon?: React.ReactNode;
  className?: string;
};

export function StatsCard({
  title,
  children,
  Icon,
  className,
}: StatsCardProps) {
  return (
    <MagicCard
      layerClassName="bg-card"
      className={cn("hover:-translate-y-2.5 hover:shadow duration-500 rounded-lg shadow", className)}
    >

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 @2xl:p-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent className="space-y-2 @2xl:p-4 @2xl:pt-0">
        {children}
      </CardContent>
    </MagicCard>
  );
}

export function StatsCardWithSearchParams({
  title,
  children,
  className,
  searchKey,
  options,
}: StatsCardProps & { searchKey: string, options: { value: string, label: string }[] }) {
  const [searchValue, setSearchValue] = useQueryState(searchKey, { defaultValue: options?.[0]?.value || "" });

  return (
    <MagicCard
      layerClassName="bg-card"
      className={cn("hover:-translate-y-2.5 hover:shadow duration-500 rounded-lg shadow", className)}
    >

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 @2xl:p-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Select defaultValue={searchValue} onValueChange={(value) => setSearchValue(value)}>
          <SelectTrigger className="md:h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2 @2xl:p-4 @2xl:pt-0">
        {children}
      </CardContent>
    </MagicCard>
  );
}