import { AnimatedTestimonials } from "@/components/animation/animated-testimonials";
import {
  StaggerChildrenContainer,
  StaggerChildrenItem,
} from "@/components/animation/motion";
import { RouterCard } from "@/components/common/router-card";
import { testimonialsContent } from "@/constants/landing";
import { getLinksByRole, quick_links } from "@/constants/links";
import { TrendingUp } from "lucide-react";
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
    <main className="flex flex-col w-full min-h-screen gap-12 px-4 md:px-6 pt-4 md:pt-6 xl:px-12 xl:mx-auto max-w-(--max-app-width) max-sm:pb-16">
      {/* SEO Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: appConfig.name,
          url: appConfig.url,
          applicationCategory: "Education",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
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

      {/* Visual hook: High contrast intro */}
      {/* <BackgroundBeamsWithCollision className="h-auto md:h-auto md:min-h-96 flex flex-col justify-center overflow-hidden w-full"> */}
      <IntroSection user={session?.user} stats={publicStats} />
      {/* </BackgroundBeamsWithCollision> */}

      <div className="w-full max-w-(--max-app-width) mx-auto flex flex-col gap-24 py-16">
        {/* Purpose: Immediate utility access. Clean, grid-based layout. */}
        <StaggerChildrenContainer id="quick-links" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Your Ecosystem
              </h2>
              <p className="text-lg text-muted-foreground mt-1 max-w-2xl text-balance">
                Access results, manage attendance, and find resources instantly.
              </p>
            </div>
          </div>

          <StaggerChildrenItem className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {links.map((link, i) => (
              <RouterCard
                key={link.href}
                {...link}
                style={{ animationDelay: `${i * 100}ms` }}
                // We can add logic here to span specific distinct cards if needed
                // className={i === 0 ? "md:col-span-2" : ""}
              />
            ))}
          </StaggerChildrenItem>
        </StaggerChildrenContainer>

        {/* --- FEATURES DEEP DIVE --- */}
        <section className="py-8">
          <FeatureSection />
        </section>

        <StaggerChildrenContainer
          className="space-y-12 pb-16"
          id="testimonials"
        >
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" /> trusted by students
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              What your peers are saying
            </h2>
            <p className="text-muted-foreground text-lg">
              Hear how the College Ecosystem is simplifying campus life for
              thousands of students.
            </p>
          </div>
          <AnimatedTestimonials data={testimonialsContent} />
        </StaggerChildrenContainer>
      </div>
    </main>
  );
}
