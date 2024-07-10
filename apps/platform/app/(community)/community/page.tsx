import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_IMAGES, CATEGORY_TYPES } from "src/constants/community";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Communities | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: `Explore different communities`,
};

export default async function CommunitiesPage() {
  return (
    <div className="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 items-stretch gap-4 rounded-md bg-muted text-muted-foreground w-full p-2">
      {CATEGORY_TYPES.map((category) => {
        return (
          <Link
            href={`/community/${category}`}
            className={cn(
              "inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg p-4 font-medium text-gray-700 transition-all border border-gray-50/30 text-md w-full capitalize",
              " hover:text-gray-800 transition-colors backdrop-blur-2xl hover:bg-white/10 hover:shadow hover:border-primary/5"
            )}
            key={category}
          >
            <div>
              <Image
                src={CATEGORY_IMAGES[category]}
                alt={category}
                width={120}
                height={120}
                className="aspect-square w-auto h-full max-h-16"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{category}</h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
