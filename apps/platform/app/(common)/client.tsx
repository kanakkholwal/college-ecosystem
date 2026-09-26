"use client";

import {
  StaggerChildrenContainer,
  StaggerChildrenItem,
} from "@/components/animation/motion";
import FeatureCard from "@/components/common/feature-card";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/utils/link";
import { featuresSectionContent } from "@/constants/landing";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import type { Session } from "~/auth";
import { PublicStatsType } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 18,
    },
  },
};

export function IntroSection({
  user,
  stats,
}: {
  user: Session["user"] | null | undefined;
  stats: PublicStatsType;
}) {
  const displayStats = [
    {
      label: "Students",
      value: stats.userCount,
    },
    {
      label: "Sessions",
      value: stats.sessionCount,
    },
    {
      label: "Platform Visits",
      value: stats.visitors,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24 lg:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_50%,transparent_100%)]" />
      </div>

      <StaggerChildrenContainer
        variants={containerVariants}
        className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-4 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"
      >
        {/* LEFT */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <StaggerChildrenItem variants={itemVariants}>
            {user ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Welcome back, {user.name}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary" />
                A unified digital campus platform
              </div>
            )}
          </StaggerChildrenItem>

          <StaggerChildrenItem variants={itemVariants}>
            <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Your Campus.
              <span className="block text-primary">Connected.</span>
            </h1>
          </StaggerChildrenItem>

          <StaggerChildrenItem variants={itemVariants}>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Campus 360 brings academics, attendance, schedules, results,
              notices, resources, events, and campus services together in one
              simple platform.
            </p>
          </StaggerChildrenItem>

          <StaggerChildrenItem
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <ButtonLink
              size="lg"
              href={user ? `/${user.other_roles[0]}` : "/auth/sign-in"}
              className="h-12 rounded-xl px-7 shadow-lg shadow-primary/20"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <Icon name="arrow-right" className="ml-2 size-4" />
            </ButtonLink>

            <ButtonLink
              size="lg"
              variant="outline"
              href="#quick-links"
              className="h-12 rounded-xl px-7"
            >
              Explore Platform
            </ButtonLink>
          </StaggerChildrenItem>

          {/* Stats */}
          <StaggerChildrenItem
            variants={itemVariants}
            className="mt-10 w-full max-w-xl border-t border-border/60 pt-7"
          >
            <div className="grid grid-cols-3 divide-x divide-border/60">
              {displayStats.map((stat) => (
                <div key={stat.label} className="px-4 first:pl-0">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}+
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </StaggerChildrenItem>
        </div>

        {/* RIGHT */}
        <StaggerChildrenItem variants={itemVariants}>
          <CampusDashboardPreview />
        </StaggerChildrenItem>
      </StaggerChildrenContainer>
    </section>
  );
}

function CampusDashboardPreview() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      className="relative mx-auto w-full max-w-[680px]"
    >
      {/* Glow */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-primary/10 blur-3xl" />

      {/* Main application window */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
        {/* Browser / app header */}
        <div className="flex h-12 items-center border-b border-border/60 bg-muted/20 px-4">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="mx-auto rounded-md bg-muted/60 px-8 py-1">
            <span className="text-[10px] text-muted-foreground">
              campus360
            </span>
          </div>

          <div className="size-6 rounded-full bg-primary/10" />
        </div>

        {/* Dashboard */}
        <div className="p-4 sm:p-6">
          {/* Dashboard top */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Campus 360
              </p>

              <h3 className="mt-1 text-lg font-bold tracking-tight">
                Student Dashboard
              </h3>
            </div>

            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="size-4" />
            </div>
          </div>

          {/* Overview cards */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DashboardStat
              icon={ClipboardCheck}
              label="Attendance"
              value="87%"
            />

            <DashboardStat
              icon={BookOpen}
              label="Classes"
              value="04"
            />

            <DashboardStat
              icon={GraduationCap}
              label="Results"
              value="8.7"
            />

            <DashboardStat
              icon={CalendarDays}
              label="Events"
              value="06"
            />
          </div>

          {/* Main grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
            {/* Schedule */}
            <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Today&apos;s Schedule</p>

                <CalendarDays className="size-4 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                <ScheduleRow
                  time="10:00"
                  title="Data Science"
                  room="Room 204"
                />

                <ScheduleRow
                  time="12:00"
                  title="Database Systems"
                  room="Lab 02"
                />

                <ScheduleRow
                  time="02:30"
                  title="Software Engineering"
                  room="Room 301"
                />
              </div>
            </div>

            {/* Notices */}
            <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Latest Notices</p>

                <FileText className="size-4 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                <NoticeRow text="Examination registration" />

                <NoticeRow text="Academic calendar update" />

                <NoticeRow text="Campus event announcement" />
              </div>
            </div>
          </div>

          {/* Bottom status */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
            <CheckCircle2 className="size-4 text-primary" />

            <p className="text-xs text-muted-foreground">
              Your campus information, available from one place.
            </p>
          </div>
        </div>
      </div>

      {/* Floating card */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-background p-3 shadow-xl sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>

          <div>
            <p className="text-xs font-semibold">One Campus</p>
            <p className="text-[10px] text-muted-foreground">
              One connected platform
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardStat({
  icon: IconComponent,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <IconComponent className="size-3.5" />
      </div>

      <p className="mt-3 text-lg font-bold tracking-tight">{value}</p>

      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ScheduleRow({
  time,
  title,
  room,
}: {
  time: string;
  title: string;
  room: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-2.5">
      <div className="w-10 text-[10px] font-semibold text-primary">
        {time}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium">{title}</p>
        <p className="text-[9px] text-muted-foreground">{room}</p>
      </div>

      <span className="size-2 rounded-full bg-primary/70" />
    </div>
  );
}

function NoticeRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />

      <p className="text-[10px] leading-4 text-muted-foreground">{text}</p>
    </div>
  );
}

export function FeatureSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_45%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6">
        <StaggerChildrenContainer
          variants={containerVariants}
          className="space-y-14"
        >
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Campus 360
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything your campus needs.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              A single platform that brings academic information, campus
              services, communication, and resources together.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-6">
              {featuresSectionContent.left.map((feature, index) => (
                <FeatureCard
                  key={`left-${index}`}
                  feature={feature}
                  className="h-full"
                />
              ))}
            </div>

            {/* Center */}
            <div className="hidden lg:flex">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/50 p-8 text-center">
                <div className="relative flex size-32 items-center justify-center rounded-3xl border border-primary/20 bg-primary/5">
                  <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl" />

                  <div className="relative text-4xl font-bold text-primary">
                    C<span className="text-foreground">360</span>
                  </div>
                </div>

                <h3 className="mt-8 text-xl font-bold">
                  One campus. One platform.
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Designed to connect students, faculty, administration, and
                  campus services through one digital ecosystem.
                </p>

                <ButtonLink
                  variant="outline"
                  size="sm"
                  href="#quick-links"
                  className="mt-6 rounded-lg"
                >
                  Explore Platform
                  <Icon name="arrow-down" className="ml-2 size-4" />
                </ButtonLink>
              </div>
            </div>

            <div className="space-y-6">
              {featuresSectionContent.right.map((feature, index) => (
                <FeatureCard
                  key={`right-${index}`}
                  feature={feature}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </StaggerChildrenContainer>
      </div>
    </section>
  );
}

/**
 * Kept for compatibility with any existing imports.
 * The homepage now uses IntroSection.
 */
interface HeroSectionProps {
  user: Session["user"];
}

export function HeroSection({ user }: HeroSectionProps) {
  return <IntroSection user={user} stats={{} as PublicStatsType} />;
}