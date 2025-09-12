import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { ResultTypeWithId } from "src/models/result";

export function ResultCard({
  result,
  ...props
}: { result: ResultTypeWithId } & React.ComponentProps<typeof Card>) {
  return (
    <Card
      className="hover:shadow-lg animate-in popup flex flex-col items-stretch justify-between "
      {...props}
    >
      <CardHeader className="flex-row gap-2 items-center px-3 py-4">
        <div className="flex justify-center items-center size-10 rounded-full bg-muted font-bold text-lg shrink-0">
          {result.rank.college}
        </div>
        <div className="flex-auto">
          <CardTitle className="text-base">{result.name}</CardTitle>
          <CardDescription className="text-sm font-medium">
            {result.rollNo}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center px-3">
        <div>
          <p className="text-xs text-muted-foreground">Batch</p>
          <p className="text-base font-bold text-foreground">
            {result.rank.batch}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Branch</p>
          <p className="text-base font-bold text-foreground">
            {result.rank.branch}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="text-base font-bold text-foreground">
            {result.rank.class}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button size="sm">{result.semesters?.at(-1)?.cgpi ?? "0"}</Button>
        <Button size="sm" variant="default_light" asChild>
          <Link href={`/results/${result.rollNo}`} prefetch={false}>View Result</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SkeletonCard() {
  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex-row gap-2 items-center">
        <Skeleton className="w-16 h-16 rounded-full" />{" "}
        {/* Skeleton for College Rank */}
        <div>
          <Skeleton className="w-40 h-6 mb-2" /> {/* Skeleton for Name */}
          <Skeleton className="w-20 h-4" /> {/* Skeleton for Roll Number */}
        </div>
      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center">
        <div>
          <Skeleton className="w-20 h-4 mb-1" />{" "}
          {/* Skeleton for Batch Label */}
          <Skeleton className="w-20 h-6" /> {/* Skeleton for Batch Value */}
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />{" "}
          {/* Skeleton for Branch Label */}
          <Skeleton className="w-20 h-6" /> {/* Skeleton for Branch Value */}
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />{" "}
          {/* Skeleton for Class Label */}
          <Skeleton className="w-20 h-6" /> {/* Skeleton for Class Value */}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="w-16 h-6" /> {/* Skeleton for CGPI */}
        <Skeleton className="w-24 h-8 ml-2" />{" "}
        {/* Skeleton for View Result Button */}
      </CardFooter>
    </Card>
  );
}
