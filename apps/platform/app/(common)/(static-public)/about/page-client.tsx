"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { motion, useInView, Variants } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Eye,
  GitFork,
  Github,
  Globe,
  Layers,
  ShieldCheck,
  Star,
  Users,
  Zap
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRef } from "react";
import { appConfig } from "~/project.config";

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// --- TYPES ---
interface AboutPageProps {
  contributors: { name: string; username: string; avatar: string; contributions: number }[];
  stats: { visitors: number; stars: number; forks: number; contributors: number };
}

export default function AboutPage({ contributors, stats }: AboutPageProps) {
  const { resolvedTheme } = useTheme();
  const heroRef = useRef(null);
  const valuesRef = useRef(null);
  const techRef = useRef(null);
  const faqRef = useRef(null);

  const heroIn = useInView(heroRef, { once: true });
  const valuesIn = useInView(valuesRef, { once: true });
  const techIn = useInView(techRef, { once: true });
  const faqIn = useInView(faqRef, { once: true });

  const techStack = [
    { name: "Next.js Core", icon: Globe, desc: "Server-side rendering & app router." },
    { name: "TypeScript", icon: Code2, desc: "Strict type safety across the stack." },
    { name: "Tailwind CSS", icon: Cpu, desc: "Atomic, utility-first styling engine." },
    { name: "Postgres & Mongo", icon: Database, desc: "Hybrid relational & document storage." },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative pt-24 pb-12 lg:pt-32 lg:pb-20">
        {/* Background Decor (Subtle Grid) */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate={heroIn ? "visible" : "hidden"}
            variants={stagger}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Pill Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                v2.0 System Active
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground text-balance"
            >
              The Digital Infrastructure for <br />
              <span className="bg-linear-to-l from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% bg-clip-text text-transparent">
                Modern Campuses.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed text-balance"
            >
              An open-source ecosystem integrating academic results, real-time resource management,
              and student utilities into one unified operating system.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <ButtonLink
                href={appConfig.githubRepo}
                variant="rainbow"
                size="lg"
                target="_blank"
                className="h-12 px-8 rounded-full text-base"
              >
                <Github className="mr-2 size-4" /> Star on GitHub
              </ButtonLink>
              <ButtonLink
                href={content.wiki_url}
                variant="outline"
                size="lg"
                target="_blank"
                className="h-12 px-8 rounded-full border-border/50 text-base hover:bg-muted/50"
              >
                <BookOpen className="mr-2 size-4" /> Documentation
              </ButtonLink>
            </motion.div>

            {/* Stats Row (Social Proof) */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border/40 pt-12 mt-12"
            >
              <StatItem label="Total Impressions" value={stats.visitors.toLocaleString()} icon={Eye} />
              <StatItem label="GitHub Stars" value={stats.stars.toString()} icon={Star} />
              <StatItem label="Contributors" value={stats.contributors.toString()} icon={Users} />
              <StatItem label="Forks" value={stats.forks.toString()} icon={GitFork} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- VALUES / BENTO GRID --- */}
      <section ref={valuesRef} className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={valuesIn ? "visible" : "hidden"}
          variants={stagger}
          className="space-y-6"
        >
          <div className="flex flex-col items-center text-center space-y-2 mb-10">
            <h2 className="text-3xl font-semibold tracking-tight">Core Principles</h2>
            <p className="text-muted-foreground">Built on a foundation of transparency and utility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard
              title="Open Architecture"
              desc="Complete transparency. Our codebase is open for audit, ensuring security and community-driven improvements."
              icon={ShieldCheck}
              className="md:col-span-1"
            />
            <BentoCard
              title="Unified Ecosystem"
              desc="Breaking down silos. We connect disparate campus services—results, hostels, and events—into a single seamless interface."
              icon={Layers}
              className="md:col-span-2"
            />
            <BentoCard
              title="Community First"
              desc="Built by students, for students. Every feature is designed to solve real problems faced on campus daily."
              icon={Users}
              className="md:col-span-2"
            />
            <BentoCard
              title="High Performance"
              desc="Engineered for speed with edge caching and optimized database queries."
              icon={Zap}
              className="md:col-span-1"
            />
          </div>
        </motion.div>
      </section>

      {/* --- TECH STACK --- */}
      <section ref={techRef} className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate={techIn ? "visible" : "hidden"}
          variants={stagger}
          className="border-y border-border/40 py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight">Engineering <br /> Excellence</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We utilize a modern, type-safe stack designed for reliability.
                The architecture prioritizes developer experience and maintainability.
              </p>
              <ButtonLink href={content.wiki_url} variant="link" className="px-0 text-primary">
                View System Architecture <ArrowUpRight className="ml-1 size-4" />
              </ButtonLink>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-border/40 bg-background/50 p-6 transition-all hover:border-primary/40 hover:bg-muted/20"
                >
                  {/* Decorative Corner Gradient */}
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

                  <div className="relative flex flex-col justify-between h-full space-y-4">
                    {/* Top Row: Icon and Status Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background shadow-sm group-hover:border-primary/30 group-hover:text-primary transition-colors">
                        <tech.icon className="size-5" />
                      </div>

                      {/* Tech-specific "Status" badges to make it feel like a system spec */}
                      <span className="inline-flex items-center rounded-md border border-border/40 bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground font-mono uppercase tracking-wider">
                        {i === 0 ? "APP_ROUTER" :
                          i === 1 ? "STRICT_MODE" :
                            i === 2 ? "JIT_ENGINE" : "CLUSTERED"}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-medium text-foreground text-base mb-1 flex items-center gap-2">
                        {tech.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tech.desc}
                      </p>
                    </div>

                    {/* Bottom decorative line (Progress bar style) */}
                    <div className="w-full bg-border/30 h-1 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-primary/40 w-[60%] group-hover:w-[80%] transition-all duration-500 ease-out" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- CONTRIBUTORS SECTION --- */}
      <section className="container mx-auto px-4">
        <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-background/50 p-8 lg:p-12 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">

          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-50" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Left: Call to Action */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                <Users className="mr-2 size-3 text-primary" />
                Community Powered
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Built by <span className="text-primary">{stats.contributors}+</span> Maintainers
              </h2>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                We are building the operating system for our campus, together.
                Every line of code is transparent, auditable, and crafted by students like you.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                <ButtonLink
                  href={content.contributing_url}
                  variant="rainbow"
                  className="rounded-full h-11 px-6 shadow-md shadow-primary/20"
                >
                  <Github className="mr-2 size-4" /> Start Contributing
                </ButtonLink>
                <ButtonLink
                  href={`${appConfig.githubRepo}/graphs/contributors`}
                  variant="ghost"
                  className="rounded-full h-11 px-6 text-muted-foreground hover:text-foreground"
                >
                  View All Contributors <ArrowUpRight className="ml-2 size-3.5" />
                </ButtonLink>
              </div>
            </div>

            {/* Right: Avatar Grid (The "Roster") */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="grid grid-cols-6 gap-2 sm:gap-3 p-4 rounded-2xl bg-background/40 border border-border/30 backdrop-blur-sm shadow-sm">
                {contributors.slice(0, 17).map((c, i) => (
                  <a
                    key={i}
                    href={`https://github.com/${c.username}`}
                    target="_blank"
                    title={c.name}
                    className="relative group"
                  >
                    <div className="relative size-10 sm:size-12 rounded-xl overflow-hidden border border-border/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:border-primary/50 group-hover:z-10 bg-muted">
                      <Image
                        src={c.avatar}
                        alt={c.name}
                        width={48}
                        height={48}
                        className="object-cover h-full w-full grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                    </div>
                  </a>
                ))}

                {/* The "You?" Slot */}
                <a
                  href={content.contributing_url}
                  className="flex flex-col items-center justify-center size-10 sm:size-12 rounded-xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-primary hover:border-primary/40 transition-colors"
                  title="This could be you"
                >
                  <div className="text-[10px] font-bold">+YOU</div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* --- FAQ SECTION --- */}
      <section ref={faqRef} className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial="hidden"
          animate={faqIn ? "visible" : "hidden"}
          variants={stagger}
        >
          <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
                <AccordionTrigger className="text-base font-medium text-foreground/80 hover:text-foreground hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatItem({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center gap-2 text-2xl lg:text-3xl font-bold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Icon className="size-3.5" /> {label}
      </div>
    </div>
  );
}

function BentoCard({ title, desc, icon: Icon, className }: { title: string; desc: string; icon: any; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border/40 bg-card p-6 lg:p-8 hover:border-primary/40 transition-colors", className)}>
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

// --- DATA ---

const faqItems = [
  {
    q: "What is the mission of this project?",
    a: "To democratize campus technology. We provide a free, open-source alternative to expensive proprietary ERP systems, built specifically for the needs of our university."
  },
  {
    q: "Is the student data secure?",
    a: "Yes. We strictly follow data privacy guidelines. Personal data is encrypted, and as an open-source project, our security protocols are open for audit by the community."
  },
  {
    q: "How can I request a new feature?",
    a: "Feature requests are managed via GitHub Issues. You can submit a proposal, and the community will vote and discuss the implementation details."
  },
  {
    q: "Is this platform officially endorsed?",
    a: "This is a student-run initiative built to supplement existing college infrastructure. While we work closely with student bodies, we operate independently."
  }
];

export const content = {
  headline: "The Digital Infrastructure for Modern Campuses",
  wiki_url: "https://github.com/kanakkholwal/college-ecosystem/wiki/Introduction",
  contributing_url: "https://github.com/kanakkholwal/college-ecosystem/blob/main/CONTRIBUTING.md",
};