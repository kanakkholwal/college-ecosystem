import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import type { ResultType, rawResultSchemaType } from "~/lib/server-apis/types";

export function ResultCard({
  result,
  ...props
}: { result: rawResultSchemaType | ResultType } & React.ComponentProps<
  typeof Card
>) {
  return (
    <Card className="flex flex-col items-stretch justify-between " {...props}>
      <CardHeader className="flex-row gap-2 items-center px-3 py-4">
        <div className="flex-auto">
          <CardTitle className="text-base">{result.name}</CardTitle>
          <CardDescription className="text-xs">
            {result.rollNo} | {result.branch}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="justify-between">
        <Badge size="sm">{result.semesters?.at(-1)?.cgpi ?? "0"}</Badge>
        <Button size="sm" variant="default_soft" asChild>
          <Link href={`/results/${result.rollNo}`} target="_blank">
            View Result
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
