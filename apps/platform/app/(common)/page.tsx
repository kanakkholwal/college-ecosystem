import {
  StaggerChildrenContainer,
  StaggerChildrenItem,
} from "@/components/animation/motion";
import { RouterCard } from "@/components/common/router-card";
import { getLinksByRole, quick_links } from "@/constants/links";
import { redirect } from "next/navigation";
import { getPublicStats } from "~/actions/public";
import { getSession } from "~/auth/server";
import { ROLES_ENUMS } from "~/constants";
import { appConfig } from "~/project.config";
import { FeatureSection, IntroSection } from "./client";

export default async function HomePage() {
  const session = await getSession();

  const links = getLinksByRole(
    session?.user?.other_roles[0] ?? ROLES_ENUMS.STUDENT,
    quick_links
  );

  if (
    session?.user?.other_roles?.includes(ROLES_ENUMS.GUARD) &&
    session?.user?.role !== ROLES_ENUMS.ADMIN
  ) {
    return redirect(`/${ROLES_ENUMS.GUARD}`);
  }

  const publicStats = await getPublicStats();

  return (
    <main className="min-h-screen w-full">
      {/* SEO Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: appConfig.name,
          url: appConfig.url,
          applicationCategory: "Education",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          operatingSystem: "Web",
          featureList: [
            "Exam Results",
            "Course Syllabus",
            "Classroom Availability",
            "Academic Schedules",
            ...appConfig.keywords,
          ],
        })}
      </script>

      {/* Hero */}
      <IntroSection
        user={session?.user}
        stats={publicStats}
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-col px-4 md:px-8">
        {/* Quick Links */}
        <section
          id="quick-links"
          className="border-t border-border/50 py-20 md:py-24"
        >
          <StaggerChildrenContainer className="space-y-10">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Quick access
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything in one place.
              </h2>

              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Quickly access the tools and services available to you based
                on your campus role.
              </p>
            </div>

            <StaggerChildrenItem className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {links.map((link, index) => (
                <RouterCard
                  key={link.href}
                  {...link}
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                />
              ))}
            </StaggerChildrenItem>
          </StaggerChildrenContainer>
        </section>

        {/* Features */}
        <FeatureSection />
      </div>
    </main>
  );
}