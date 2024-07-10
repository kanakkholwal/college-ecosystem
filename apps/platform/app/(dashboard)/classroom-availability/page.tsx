import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { getRooms } from "src/lib/room/actions";
import { RoomCardPublic } from "./components/card";
import Pagination from "./components/pagination";
import SearchBox from "./components/search";

import type { Metadata } from "next";

type Props = {
  searchParams: {
    query?: string;
    page?: string;
    currentStatus?: string;
    roomType?: string;
  };
};

export const metadata: Metadata = {
  title: `Rooms | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: `Search for rooms based on their availability and type.`,
};

export default async function RoomsPage({ searchParams }: Props) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const filter = {
    currentStatus: searchParams?.currentStatus || "",
    roomType: searchParams?.roomType || "",
  };
  const { rooms, totalPages, currentStatuses, roomTypes } = await getRooms(
    query,
    currentPage,
    filter
  );

  return (
    <>
      <section
        id="hero"
        className="z-10 w-full max-w-6xl relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h2
          className="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
          data-aos="fade-up"
        >
          Rooms <span className="text-primary">Search</span>
        </h2>
        <p
          className="mt-4 text-neutral-700 dark:text-neutral-300"
          data-aos="zoom-in"
        >
          Search for rooms based on their availability and type.
        </p>
        <div
          className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6 w-full mx-auto max-w-2xl"
          data-aos="fade-up"
          data-aos-anchor-placement="center-bottom"
        >
          <Suspense
            fallback={
              <>
                <Skeleton className="h-12 w-full " />
              </>
            }
          >
            <SearchBox statuses={currentStatuses} types={roomTypes} />
          </Suspense>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room, i) => {
          return (
            <RoomCardPublic
              key={room._id.toString()}
              room={room}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6 mt-5">
        {rooms.length > 0 ? <Pagination totalPages={totalPages} /> : null}
      </div>
    </>
  );
}
