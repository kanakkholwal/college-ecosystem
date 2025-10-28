"use client";

import { NumberTicker } from "@/components/animation/number-ticker";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/utils/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { benefitsCategories, benefitsList, submitBenefitsLink } from "root/resources/benefits";

const words = ["builders", "hackers", "founders", "creators", "developers"];

const totalBenefits = benefitsList.length;
const totalCategories = benefitsCategories.length - 1; // Exclude 'all' category

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % words.length),
      2000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
      {/* Avatars + Stars */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex w-fit flex-col items-center gap-4 sm:flex-row"
      >
        {/* Avatars */}
        <span className="mx-4 inline-flex items-center -space-x-4">
          {[
            "https://pbs.twimg.com/profile_images/1824509052946092032/EnePry3o_400x400.jpg",
            "",
            "https://pbs.twimg.com/profile_images/1904319753537122304/9QjLNJ1W_400x400.jpg",
            "https://pbs.twimg.com/profile_images/1911892145515991040/x7st7XBY_400x400.jpg",
            "https://pbs.twimg.com/profile_images/1874056278684692480/wHMRHz7v_400x400.jpg",
          ].map((src, i) => (
            <span
              key={i}
              className="relative flex shrink-0 overflow-hidden rounded-full size-14 border"
            >
              {src && (
                <img
                  src={src}
                  alt={`User ${i + 1}`}
                  className="aspect-square h-full w-full"
                />
              )}
            </span>
          ))}
        </span>

        {/* Stars + Text */}
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-5 fill-yellow-400 text-yellow-400 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <p className="text-left font-medium text-muted-foreground">
            Trusted by <NumberTicker value={2000} suffix="+" className="mx-1" />
            College students
          </p>
        </div>
      </motion.div>

      {/* Title + Rotating Words */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center">
          <span className="text-neutral-800 dark:text-cyan-50">Free stuff for college</span>
          <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 h-[1em] ">
            {words.map((word, i) => (
              <motion.span
                key={word}
                className="absolute font-semibold bg-linear-to-l from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% bg-clip-text text-transparent"
                initial={{ y: "100%", opacity: 0 }}
                animate={
                  i === index
                    ? { y: 0, opacity: 1 }
                    : { y: "-100%", opacity: 0 }
                }
                transition={{ duration: 0.6 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>
        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
          Curated free tools, software credits, and fellowships for college
          builders. Everything you need to build without breaking the bank.
        </p>
        {/* Quick Stats */}
        <div className="flex gap-6 text-sm mx-auto mt-8 justify-center">
          <div>
            <NumberTicker value={totalBenefits} suffix="+" className="mx-1 text-2xl font-bold" />
            <div className="text-muted-foreground">Resources</div>
          </div>
          <div>
            <NumberTicker value={totalCategories} suffix="+" className="mx-1 text-2xl font-bold" />
            <div className="text-muted-foreground">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">Free</div>
            <div className="text-muted-foreground">Always</div>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <ButtonLink href="#benefits" size="lg" variant="rainbow_outline">
          Check out the benefits
          <Icon name="arrow-right" />
        </ButtonLink>
        <ButtonLink href={submitBenefitsLink} size="lg" variant="default">
          <Icon name="sparkles" />
          Submit a Resource
          <Icon name="arrow-up-right" />
        </ButtonLink>
      </motion.div>
    </section>
  );
}
