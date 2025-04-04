import { RouterCard } from "@/components/common/router-card";
import { BannerPanel } from "@/components/utils/banner";
import ConditionalRender from "@/components/utils/conditional-render";
import { getLinksByRole, quick_links } from "@/constants/links";
// import Link from "next/link";
import { ROLES } from "~/constants";
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";
import { HeroSection } from "./client";
import { redirect } from "next/navigation";

const PROMO = {
  title: "Update your Gender",
  description:
    "We are updating our records to better serve you for upcoming new features.",
  label: "Update Now!",
  showTill: "2022-01-19T19:00:00",
  getConditionByUser: (user: Session["user"]) =>
    user?.other_roles.includes(ROLES.STUDENT) &&
    user?.gender === "not_specified" &&
    new Date() < new Date(PROMO.showTill),
};

export default async function Dashboard() {
  const session = (await getSession()) as Session;

  const links = getLinksByRole(session?.user?.other_roles[0], quick_links);
  if (
    session?.user.other_roles.includes(ROLES.GUARD) &&
    session?.user.role !== ROLES.ADMIN
  ) {
    return redirect(`/${ROLES.GUARD}`);
  }
  return (
    <>
      <ConditionalRender condition={PROMO.getConditionByUser(session?.user)}>
        <BannerPanel
          title={PROMO.title}
          description={PROMO.description}
          btnProps={{
            children: PROMO.label,
            variant: "default_light",
          }}
        />
      </ConditionalRender>
      <HeroSection user={session?.user} />
      <section
        id="quick-links"
        className="z-10 w-full max-w-6xl mx-auto relative space-y-4 text-left"
      >
        <h2
          className="text-lg md:text-2xl lg:text-4xl font-bold whitespace-nowrap text-neutral-900 dark:text-neutral-100"
          data-aos="fade-right"
          data-aos-duration="500"
        >
          Quick Links
        </h2>

        <div className="mb-32 grid  lg:mb-0 lg:w-full mx-auto @5xl:max-w-6xl grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 text-left gap-4">
          {links.map((link, i) => (
            <RouterCard
              key={link.href}
              {...link}
              style={{
                animationDelay: `${i * 500}ms`,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
