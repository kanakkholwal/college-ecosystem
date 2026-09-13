import { ClosingCta } from "@/components/landing/closing-cta";
import { FeatureBento } from "@/components/landing/feature-bento";
import { HeroSection } from "@/components/landing/hero-section";
import { ModuleLauncher } from "@/components/landing/module-launcher";
import { FaqList } from "@/components/site/faq-list";
import { RailRow } from "@/components/site/rail";
import { ButtonLink } from "@/components/utils/link";
import { getLinksByRole, quick_links } from "@/constants/links";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "~/auth/server";
import { ROLES_ENUMS } from "~/constants";
import { appConfig, orgConfig } from "~/project.config";

const faqs = [
  {
    q: "Who can use the platform?",
    a: `Anyone can check results, the syllabus, timetables and classroom availability. Signing in with your ${orgConfig.mailSuffix} account opens the community, polls and your dashboard.`,
  },
  {
    q: "Is this an official college website?",
    a: "No. It is a student-run project built to sit alongside the college's own systems. It works independently of the administration.",
  },
  {
    q: "Is it free?",
    a: "Yes. There is nothing to pay and nothing to install. It runs in any up-to-date browser on your phone or laptop.",
  },
  {
    q: "Why can't I sign in with my personal Gmail?",
    a: `Community spaces are only for people at ${orgConfig.shortName}, so sign-in accepts ${orgConfig.mailSuffix} accounts only.`,
  },
  {
    q: "I found a mistake or want a new feature. Where do I go?",
    a: "Open an issue on GitHub or send feedback through the form in the footer. The code is open, so you can also send the fix yourself.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  const role = session?.user?.other_roles?.[0] ?? ROLES_ENUMS.STUDENT;

  if (
    session?.user?.other_roles?.includes(ROLES_ENUMS.GUARD) &&
    session?.user?.role !== ROLES_ENUMS.ADMIN
  ) {
    return redirect(`/${ROLES_ENUMS.GUARD}`);
  }

  const moduleCount = getLinksByRole(role, quick_links).length;
  const dashboardHref = session?.user ? `/${session.user.other_roles[0]}` : "/";

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: appConfig.name,
              url: appConfig.url,
              applicationCategory: "Education",
              offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
              operatingSystem: "Web",
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]),
        }}
      />

      <RailRow
        divider={false}
        label="Introduction"
        className="px-3 pt-6 pb-4 sm:px-6 sm:pt-10 sm:pb-6"
      >
        <HeroSection user={session?.user} moduleCount={moduleCount} />
      </RailRow>

      <RailRow id="modules" label="Find a module" className="pb-10 sm:pb-14">
        <ModuleLauncher role={role} />
      </RailRow>

      <RailRow id="features" label="Features">
        <FeatureBento />
      </RailRow>

      <RailRow
        id="faq"
        label="Frequently asked questions"
        className="justify-center"
      >
        <div className="relative w-full px-1 py-6 sm:px-4 sm:py-8 lg:px-16 lg:py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
            <div className="flex shrink-0 flex-col gap-2 lg:w-110">
              <h2 className="text-heading-lg font-medium text-foreground">
                Frequently asked
                <br />
                <span className="text-primary">questions</span>
              </h2>
              <p className="text-body text-muted-foreground">
                Can't find what you're looking for?
                <br />
                We're here to help.
              </p>
              <ButtonLink href="/contact" className="mt-6 w-fit">
                Contact us
                <MessageSquare />
              </ButtonLink>
            </div>
            <div className="w-full flex-1">
              <FaqList items={faqs} variant="cards" />
            </div>
          </div>
        </div>
      </RailRow>

      <RailRow label="Get started">
        <ClosingCta signedIn={!!session?.user} dashboardHref={dashboardHref} />
      </RailRow>
    </>
  );
}
