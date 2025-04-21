import RoomCard from "@/components/application/room-card";
import SearchBox from "@/components/application/room-search";
import EmptyArea from "@/components/common/empty-area";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionalRender from "@/components/utils/conditional-render";
import ErrorBanner from "@/components/utils/error";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { listAllRoomsWithHistory } from "~/actions/room";
import { getSession } from "~/lib/auth-server";

type Props = {
  searchParams: Promise<{
    query?: string;
    currentStatus?: string;
  }>;
};

export const metadata: Metadata = {
  title: `Rooms | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Search for rooms based on their availability and type.",
};

export default async function RoomsPage(props: Props) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  const rooms = await listAllRoomsWithHistory({
    status: searchParams.currentStatus,
    roomNumber: searchParams.query,
  });

  return (
    <div className="px-4 md:px-12 xl:px-6 @container">
      <section
        id="hero"
        className="z-10 w-full max-w-6xl mx-auto  relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h2 className="text-3xl font-semibold text-center whitespace-nowrap">

          Rooms <span className="text-primary">Search</span>
        </h2>
        <p
          className="mt-4 mb-8 text-lg text-muted-foreground">

          Search for rooms based on their availability and type.
        </p>
        <div
          className="mt-10 flex flex-wrap justify-center gap-y-4 gap-x-6 w-full mx-auto max-w-2xl"
          data-aos="fade-up"
          data-aos-anchor-placement="center-bottom"
        >
          <SearchBox />
        </div>
      </section>
      <ErrorBoundaryWithSuspense
        fallback={<ErrorBanner />}
        loadingFallback={
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Skeleton className="w-full h-96" key={i} />
            ))}
          </div>
        }
      >
        <ConditionalRender condition={rooms.length === 0}>
          <EmptyArea
            icons={[Search]}
            title="No rooms found"
            description="Try adjusting your search filters."
          />
        </ConditionalRender>
        <ConditionalRender condition={rooms.length > 0}>
          <div className="mx-auto max-w-7xl w-full xl:px-6 grid gap-3 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
            {rooms.map((room, i) => {
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  user={session?.user}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              );
            })}
          </div>
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}
