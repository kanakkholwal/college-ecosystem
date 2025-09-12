import { AnimatedTestimonials } from "@/components/animation/animated-testimonials";
import { BackgroundBeamsWithCollision } from "@/components/animation/bg-beam-with-collision";
import { StaggerChildrenContainer, StaggerChildrenItem } from "@/components/animation/motion";
import { HeaderBar } from "@/components/common/header-bar";
import { RouterCard } from "@/components/common/router-card";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/utils/link";
import { SkeletonCardArea } from "@/components/utils/skeleton-cards";
import { testimonialsContent } from "@/constants/landing";
import { getLinksByRole, quick_links } from "@/constants/links";
import { ResourcesList } from "app/(common)/(general)/resources/client";
import { Newspaper } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPublicStats } from "~/actions/public";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { getAllResources } from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";
import { FeatureSection, IntroSection } from "./client";

const RESOURCES_LIMIT = 6; // Limit the number of resources fetched

export default async function HomePage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });
  // Get quick links based on user role
  const links = getLinksByRole(session?.user?.other_roles[0] ?? ROLES_ENUMS.STUDENT, quick_links);

  if (
    session?.user?.other_roles?.includes(ROLES_ENUMS.GUARD) &&
    session?.user?.role !== ROLES_ENUMS.ADMIN
  ) {
    return redirect(`/${ROLES_ENUMS.GUARD}`);
  }

  const [publicStats, resources] = await Promise.all([
    getPublicStats(),
    getAllResources(RESOURCES_LIMIT),
  ]);

  return (
    <div className="flex flex-col w-full flex-1 gap-12 px-4 md:px-6 pt-4 md:pt-6 xl:px-12 xl:mx-auto max-w-(--max-app-width) max-sm:pb-16">
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

      {/* Intro */}
      <BackgroundBeamsWithCollision className="md:h-auto md:min-h-96">
        <IntroSection user={session?.user} stats={publicStats} />
      </BackgroundBeamsWithCollision>

      {/* Quick Links */}
      <StaggerChildrenContainer id="quick-links" className="space-y-6">
        <h2 className="text-xl font-semibold">
          Explore Results, Room Allotment, and More
        </h2>
        <StaggerChildrenItem className="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 gap-4">
          {links.map((link, i) => (
            <RouterCard
              key={link.href}
              {...link}
              style={{ animationDelay: `${i * 500}ms` }}
            />
          ))}
        </StaggerChildrenItem>
      </StaggerChildrenContainer>

      {/* Feed Placeholder */}
      <StaggerChildrenContainer className="space-y-4" id="feed">
        <HeaderBar
          Icon={Newspaper}
          titleNode="Latest Updates"
          descriptionNode="Stay updated with announcements, guides, and student-written posts."
          className="mb-8"
        />
        <Suspense fallback={<SkeletonCardArea count={RESOURCES_LIMIT} />}>
          <ResourcesList resources={resources} showImage={false} />
        </Suspense>
        <StaggerChildrenItem className="w-full py-2 flex justify-center">
          <ButtonLink href="/resources" size="lg" variant="rainbow_outline">
            Checkout All Updates
            <Icon name="arrow-right" />
          </ButtonLink>
        </StaggerChildrenItem>
      </StaggerChildrenContainer>

      <FeatureSection />


      <StaggerChildrenContainer className="space-y-4" id="testimonials">
        <h2 className="text-xl font-semibold text-center">
          What Students Are Saying
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Hear from your peers about how the College Ecosystem is transforming
          campus life.
        </p>
        <AnimatedTestimonials data={testimonialsContent} />
      </StaggerChildrenContainer>
    </div>
  );
}
