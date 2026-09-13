"use client";

import { useEffect, useRef, useState } from "react";

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats as "1.8M+": counts are lower bounds that keep growing. */
export const formatStat = (n: number) => `${compact.format(n)}+`;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Counts from 0 to `value` once it scrolls into view; jumps straight to it under reduced motion. */
export function CountUp({
  value,
  duration = 1200,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(Math.round(value * easeOutCubic(t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{formatStat(shown)}</span>
      <span className="sr-only">{formatStat(value)}</span>
    </span>
  );
}
