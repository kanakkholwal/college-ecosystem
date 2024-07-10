import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { FolderClosed } from "lucide-react";
import Link from "next/link";
import { CgSpinner } from "react-icons/cg";
import { GetFiles } from "src/lib/storage";
import { FileCard } from "./file-card";

interface PageProps {
  searchParams: {
    query?: string;
    offset?: number;
  };
}

export default async function StoragePage({ searchParams }: PageProps) {
  const offset = Number(searchParams.offset) || 1;
  const query = searchParams.query || "";

  const files = await GetFiles({ query, offset });

  return (
    <div className="space-y-6 my-5">
      <h1 className="text-2xl font-bold">
        Storage across the platform on Cloud
      </h1>
      <p className="text-gray-700">
        All the files uploaded by users across the platform are stored here.
      </p>
      <p className="text-gray-700">
        {files.length === 0
          ? "No files found"
          : `Showing ${files.length} files`}
        {` | `}
        <Link href="/storage/upload">Upload new file</Link>
      </p>

      <ErrorBoundaryWithSuspense
        loadingFallback={
          <div className="flex justify-center items-center py-5 px-4">
            <CgSpinner className="animate-spin h-10 w-10" />
          </div>
        }
        fallback={<div>Error loading files</div>}
      >
        <ConditionalRender condition={files.length === 0}>
          <EmptyArea
            Icon={FolderClosed}
            title="No files found"
            description="No files found in the storage. You can upload a new file by clicking the button below."
            actionPanel={
              <>
                <Button variant="default_light" className="mx-auto" asChild>
                  <Link href="/storage/upload">Upload new file</Link>
                </Button>
              </>
            }
          />
        </ConditionalRender>
        <ConditionalRender condition={files.length > 0}>
          {files.map((file) => {
            return <FileCard file={file} key={file._id} />;
          })}
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}
