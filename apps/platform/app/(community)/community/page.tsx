import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "~/constants/community";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Communities | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Explore different communities",
};

export default function CommunitiesPage() {
  return (
    <div className="max-w-5xl mx-auto pb-32">
      <div className="ml-4">
        <h2>
          <span className="text-xl font-semibold text-center whitespace-nowrap">
            Communities{" "}
            <span className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Portal
            </span>
          </span>
          <p className="mb-8 text-base text-muted-foreground">
            Explore different communities and connect with like-minded
            individuals.
          </p>
        </h2>
      </div>
      <div className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 items-stretch gap-4 w-full p-4">
        {CATEGORIES.map((category) => {
          return (
            <Link
              href={`/community/${category.value}`}
              className={cn(
                "inline-flex items-center justify-start gap-2 rounded-lg flex-col @md:flex-row bg-card p-4 font-medium text-muted-foreground transition-all border text-md w-full capitalize",
                "transition-colors hover:shadow hover:border-primary/75"
              )}
              key={category.value}
            >
              <div className="p-2">
                <Image
                  src={category.image}
                  alt={category.description}
                  width={160}
                  height={160}
                  className="aspect-square size-12 rounded-md object-cover"
                  priority
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-primary">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
