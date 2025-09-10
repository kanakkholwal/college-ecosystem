"use client";
import { Megaphone } from "lucide-react";

import { AnimatedGradientText } from "@/components/animation/animated-shiny-text";
import { FloatingElements } from "@/components/animation/floating-elements";
import { StaggerChildrenContainer, StaggerChildrenItem } from "@/components/animation/motion";
import { NumberTicker } from "@/components/animation/number-ticker";
import FeatureCard from "@/components/common/feature-card";
import { Icon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/utils/link";
import { featuresSectionContent } from "@/constants/landing";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { motion, spring } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Globe,
  GraduationCap,
  Home,
  MoreHorizontal,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Session } from "~/auth";
import { PublicStatsType } from "~/lib/third-party/github";
import { appConfig, orgConfig } from "~/project.config";
import { getGreeting } from "~/utils/misc";

interface HeroSection {
  user: Session["user"];
}

export function HeroSection({ user }: HeroSection) {
  return (
    <div
      id="hero-section"
      className="z-10 w-full max-w-7xl max-h-96 relative flex flex-col gap-4 items-center justify-center py-24 px-2 sm:px-4 rounded-lg text-center lg:text-left"
      suppressHydrationWarning={true}
    >
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-30 flex w-full items-center justify-center flex-col px-4 py-8 bg-background/30 border-muted/30 max-w-xl rounded-3xl border backdrop-blur"
      >
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="font-bold tracking-tight mb-4 max-w-5xl mt-10 group relative"
        >
          <AnimatedGradientText
            className={cn(
              user
                ? "text-base sm:text-3xl"
                : "text-3xl sm:text-4xl md:text-5xl"
            )}
          >
            {getGreeting()}
          </AnimatedGradientText>{" "}
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-secondary dark:from-foreground to-primary">
            {user?.name}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.35,
            type: "spring",
            damping: 20,
            stiffness: 300,
            delayChildren: 0.1,
          }}
          className="text-base text-muted-foreground text-center mb-5"
        >
          {appConfig.description.split(".")[0] ||
            "Welcome to the digital campus platform!"}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4"
        >
          <ButtonLink
            variant="dark"
            href={user ? `/${user.other_roles[0]}` : "/auth/sign-in"}
            effect="shineHover"
            transition="damped"
            shadow="dark"
          >
            <Icon name="chart-candlestick" />
            {user ? "Dashboard" : "Sign In"} <Icon name="arrow-right" />
          </ButtonLink>
          <ButtonLink
            variant="outline"
            target="_blank"
            transition="scale"
            href={`https://github.com/${appConfig.githubUri}/blob/main/CONTRIBUTING.md`}
          >
            <Icon name="github" />
            Contribute Now
            <Icon name="arrow-up-right" />
          </ButtonLink>
        </motion.div>
      </motion.div>
      <FloatingElements />
    </div>
  );
}

const bentoVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: spring, stiffness: 100 },
  },
};

const popular_features = [
  {
    name: "Results",
    icon: FileText,
    href: "/results",
    color: "text-blue-500",
  },
  {
    name: "Resources",
    icon: BookOpen,
    href: "/resources",
    color: "text-purple-500",
  },
  {
    name: "Communities",
    icon: Users,
    href: "/community",
    color: "text-green-500",
  },
  {
    name: "+5 more",
    icon: MoreHorizontal,
    href: "#quick-links",
    color: "text-yellow-500",
  },
];

const statsMapping = [
  {
    label: "Users on platform",
    icon: User,
    key: "userCount",
    value: 0,
    color: "text-cyan-500",
  },
  {
    label: "Visitors on platform",
    icon: Globe,
    key: "githubStats.visitors",
    value: 0,
    color: "text-emerald-500",
  },
  {
    label: "Stars on GitHub",
    icon: Star,
    key: "githubStats.stars",
    value: 0,
    color: "text-yellow-500",
  },
] as Array<{
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  key: keyof PublicStatsType | `githubStats.${keyof PublicStatsType["githubStats"]}`;
  value: number;
  color: string;
}>


export function IntroSection({
  user,
  stats,
}: {
  user: Session["user"] | null | undefined;
  stats: PublicStatsType;
}) {
  statsMapping.forEach((stat) => {
    const [mainKey, subKey] = stat.key.split(".").length > 1
      ? stat.key.split(".")
      : [stat.key];

    const mainValue = stats[mainKey as keyof PublicStatsType];
    if (typeof mainValue === "object" && mainValue !== null) {
      stat.value = mainValue[subKey as keyof PublicStatsType["githubStats"]];
    } else {
      stat.value = mainValue as number;
    }
  });
  return (
    <section
      className="z-10 relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-8 rounded-lg py-12 sm:py-24 lg:text-left"
      suppressHydrationWarning
    >
      <StaggerChildrenContainer
        className={cn(
          "relative z-[100] flex w-full flex-col items-center justify-center sm:px-4 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left"
        )}
      >
        {/* LEFT: value prop, CTAs, badges, stats */}
        <motion.div
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            delay: 0.05,
          }}
          className="relative z-30 flex w-full max-w-xl flex-1 flex-col items-start justify-center rounded-3xl border border-muted/40 bg-background/60 px-3 sm:px-6 py-8 backdrop-blur"
        >
          {/* Pill */}
          <motion.div
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
              New
            </span>
            Introducing {appConfig.name}
          </motion.div>

          {/* Headline — value-first */}
          <motion.h1
            variants={itemVariants}
            className="mb-3 bg-linear-to-l from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% bg-clip-text text-transparent text-3xl font-extrabold leading-tight sm:text-4xl"
          >
            All-in-One Ecosystem for {orgConfig.shortName} Students
          </motion.h1>

          {/* Subheadline + personal greeting (kept, but secondary) */}
          <motion.p
            variants={itemVariants}
            className="mb-2 text-sm text-muted-foreground font-semibold"
          >
            {getGreeting()}{" "}
            {user?.name ? (
              <>
                <span className="mx-1">•</span>
                <AnimatedGradientText className="font-semibold">
                  {user.name}
                </AnimatedGradientText>
              </>
            ) : null}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mb-6 max-w-prose text-base leading-relaxed text-muted-foreground"
          >
            {appConfig.description}
          </motion.p>

          {/* Primary + secondary CTAs (anchors & props preserved) */}
          <StaggerChildrenItem
            className="mt-2 flex flex-wrap items-center gap-4"
          >
            <ButtonLink size="responsive_lg" href="#quick-links">
              Explore Features <Icon name="arrow-right" />
            </ButtonLink>
            <ButtonLink
              size="responsive_lg"
              variant="rainbow_outline"
              target="_blank"
              transition="damped"
              onClick={() => {
                sendGAEvent('contribute_click', {
                  location: 'hero_section',
                  user_id: user?.id,
                  user_email: user?.email,
                  // Add any additional parameters you want to track
                })
              }}
              href={`https://github.com/${appConfig.githubUri}/blob/main/CONTRIBUTING.md`}
            >
              <Icon name="github" />
              Contribute Now
              <Icon name="arrow-up-right" />
            </ButtonLink>
          </StaggerChildrenItem>

          {/* Popular badges (kept) */}
          <StaggerChildrenItem
            className="mb-6 mt-5 flex flex-wrap items-center justify-start gap-3"
          >
            <span className="text-xs font-semibold text-muted-foreground">
              Popular Features
            </span>
            {popular_features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group flex items-center gap-2 rounded-full border border-border bg-card px-1.5 md:px-3 py-1 md:py-1.5 h-6 md:h-8 text-xs font-medium text-card-foreground shadow-sm transition-all hover:border-primary hover:bg-primary/5 active:scale-95 hover:scale-101"
              >
                <feature.icon
                  className={cn(feature.color, "size-3 md:size-4 transition-colors group-hover:text-primary")}
                />
                {feature.name}
              </Link>
            ))}

          </StaggerChildrenItem>

          {/* Bento stats (kept props, upgraded layout) */}
          <StaggerChildrenItem
            className="flex flex-wrap w-full max-w-lg gap-3"
          >
            {statsMapping.map((stat) => {
              return (
                <div
                  key={stat.label + stat.value}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm backdrop-blur flex-auto"
                >
                  <div className="mb-1 inline-flex items-center gap-2">
                    <stat.icon className={cn(stat.color, "size-5")} />
                    <NumberTicker
                      value={stat.value}
                      className="text-xl font-bold"
                      suffix="+"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </StaggerChildrenItem>
        </motion.div>

        {/* RIGHT: visual anchor + dashboard/sign-in + social proof (anchors & props preserved) */}
        <div className="mt-6 flex flex-1 flex-col items-center lg:items-end">
          {/* Screenshot / preview placeholder */}
          <StaggerChildrenItem
            className="mb-6 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl backdrop-blur-sm"
          >
            <HeroBentoMockup />
          </StaggerChildrenItem>


          <motion.p
            variants={itemVariants}
            className="mb-6 max-w-md px-2 text-center text-lg leading-relaxed text-pretty text-muted-foreground lg:text-right"
          >
            {appConfig.description}
          </motion.p>
          <StaggerChildrenItem className="mb-6">
            <ButtonLink
              variant="rainbow"
              size="lg"
              href={user ? `/${user.other_roles[0]}` : "/auth/sign-in"}
              effect="shineHover"
              transition="damped"
              width="sm"
              shadow="dark"
            >
              <Icon name="chart-candlestick" />
              {user ? "Go to Your Dashboard" : "Sign In to Your Account"}{" "}
              <Icon name="arrow-right" />
            </ButtonLink>
          </StaggerChildrenItem>

          {/* Social proof */}
          <StaggerChildrenItem
            className="mx-auto flex items-center gap-3 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur-sm lg:mx-0"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-6 overflow-hidden rounded-full border-2 border-card bg-border"
                >
                  <div className="h-full w-full bg-gradient-to-br from-primary/50 to-tertiary/20 opacity-80" />
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              <NumberTicker
                value={stats.sessionCount}
                className="font-semibold"
                suffix="+"
              />{" "}
              active sessions right now
            </span>
            <ArrowUpRight className="h-3 w-3 text-primary" />
          </StaggerChildrenItem>
        </div>
      </StaggerChildrenContainer>

      <FloatingElements />

      {/* Decorative beams */}
      <div className="absolute left-1/2 right-auto -bottom-40 h-96 w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-200/30 blur-[80px] lg:left-auto lg:right-96 lg:translate-x-0" />
      <div className="absolute left-1/2 right-auto -bottom-52 h-96 w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-300/20 blur-[80px] lg:left-auto lg:right-auto lg:translate-x-0" />
      <div className="absolute left-1/2 right-auto -bottom-60 h-96 w-10 -translate-x-20 -rotate-45 rounded-full bg-gray-300/20 blur-[80px] lg:left-auto lg:right-96 lg:-translate-x-40" />
    </section>
  );
}









export function HeroBentoMockup() {
  return (
    <motion.div
      variants={bentoVariants}
      initial="hidden"
      animate="show"
      className="relative grid w-full max-w-2xl grid-cols-2 gap-4 md:max-w-4xl"
    >
      {/* Banner for Ads/Events */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute -top-8 right-0 z-20 rounded-full bg-gradient-to-r from-primary to-tertiary px-4 py-1.5 text-xs font-semibold text-white shadow-lg"
      >
        <Megaphone className="inline h-3.5 w-3.5 mr-1" />
        Your Club Event / Ads Could Be Here
      </motion.div>

      {/* Result Card */}
      <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-background backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl transition">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">
            CGPI: <span className="text-primary font-bold">9.2</span>
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div className="h-2 w-[80%] rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Hostel Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Home className="h-4 w-4 text-primary" />
            Hostel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Room 204 · 3 Seater
          <p className="text-foreground font-semibold mt-0.5">Allotted ✅</p>
        </CardContent>
      </Card>

      {/* Clubs Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Upcoming Hackathon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          Hackathon 2025
          <p className="text-muted-foreground">Starts in 3 days</p>
        </CardContent>
      </Card>

      {/* User Reach Card */}
      <Card className="col-span-2 rounded-2xl border border-border bg-gradient-to-r from-primary/5 to-card shadow pt-5 hover:shadow-lg transition">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold">12,000+</p>
            <p className="text-xs text-muted-foreground">Students Connected</p>
          </div>
          <Users className="h-7 w-7 text-primary" />
        </CardContent>
      </Card>
    </motion.div>
  );
}


export function FeatureSection() {
  return (
    <motion.section   variants={containerVariants}
            initial="hidden"
            animate="visible" className="pt-20 pb-8" id="features">
      <div className="mx-6 max-w-[1120px] pt-2 pb-16 max-[300px]:mx-4 min-[1150px]:mx-auto">
        <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {featuresSectionContent.left.map((feature, index) => (
              <FeatureCard key={`left-feature-${index}`} feature={feature} />
            ))}
          </div>

          {/* Center column */}
          <StaggerChildrenItem className="order-[1] mb-6 self-center sm:order-[0] md:mb-0">
            <div className="bg-card text-foreground ring-border relative mx-auto mb-4.5 w-fit rounded-full rounded-bl-[2px] px-4 py-2 text-sm ring">
              <AnimatedGradientText className="relative z-1 flex items-center gap-2 font-semibold">
                <Sparkles className="size-3 text-yellow-500 animate-spin animation-duration-3000" />{" "}
                Features
              </AnimatedGradientText>
              <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r"></span>
              <span className="absolute inset-0 bg-[radial-gradient(30%_40%_at_50%_100%,hsl(var(--primary)/0.25)_0%,transparent_100%)]"></span>
            </div>
            <h2 className="text-foreground mb-2 text-center text-2xl sm:mb-2.5 md:text-[2rem] font-semibold">
              Why Use College Ecosystem?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[22rem] text-center text-pretty">
              Your one-stop platform for academic results, hostel allotments,
              club activities, and everything that makes campus life simpler and
              smarter.
            </p>
          </StaggerChildrenItem>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {featuresSectionContent.right.map((feature, index) => (
              <FeatureCard key={`right-feature-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
