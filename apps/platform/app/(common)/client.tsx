"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { motion } from "motion/react";
import Link from "next/link";
import type { Session } from "~/lib/auth";
import { appConfig } from "~/project.config";
// import "./greetings.css";

interface HeroSection {
  user: Session["user"];
}

export function HeroSection({ user }: HeroSection) {
  return (
    <motion.section
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="z-10 w-full max-w-7xl max-h-96 relative flex flex-col gap-4 items-center justify-center py-24 px-2 sm:px-4 rounded-lg text-center lg:text-left"
      suppressHydrationWarning={true}
    >

      <h2 className="text-3xl font-semibold text-center">
        {getGreeting()} <span className="text-primary">{user?.name}</span>
      </h2>
      <p className="mb-8 text-lg text-muted-foreground">
        Welcome to the {appConfig.name}
      </p>
      {(user?.other_roles.includes("student") || !user) && (
        <Alert variant="info_light" className="mt-4" data-aos="fade-right">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Join the {appConfig.name} Project!</AlertTitle>
          <AlertDescription>
            We are looking for contributors to help us build the platform.
            Check out the
            <Link
              href={`${appConfig.githubRepo}/blob/main/CONTRIBUTING.md`}
              className="underline mx-1"
            >
              Contribute
            </Link>{" "}
            page for more information.
          </AlertDescription>
        </Alert>
      )}
    </motion.section>
  );
}
function getGreeting(): string {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning!";
  }
  if (currentHour >= 12 && currentHour < 17) {
    return "Good afternoon!";
  }
  return "Good evening!";
}
