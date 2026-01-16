import EmptyArea from "@/components/common/empty-area";
import { FileText, Files, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{
    moderator: string;
    notFound: string[];
  }>;
}

export default async function NotFoundFallbackPage({ params }: Props) {
  const { moderator, notFound } = await params;

  return (
    <div className="space-y-6 my-5 min-h-screen flex flex-col items-center justify-center">
      <EmptyArea
        title="No page found"
        description={
          <>
            The page{" "}
            <Link
              href={`/${moderator}/${notFound.join("/")}`}
              className="font-bold text-primary p-1 bg-primary/10 rounded-md hover:underline"
            >
              {moderator}/{notFound.join("/")}
            </Link>{" "}
            was not found.
          </>
        }
        icons={[FileText, LinkIcon, Files]}
      />
    </div>
  );
}
