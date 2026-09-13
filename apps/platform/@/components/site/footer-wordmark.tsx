"use client";

import { useState } from "react";

type Spot = { x: number; y: number; on: boolean };

/** Oversized faint wordmark; a brand-coloured spotlight follows a mouse pointer. */
export function FooterWordmark({ text }: { text: string }) {
  const [spot, setSpot] = useState<Spot>({ x: 50, y: 50, on: false });

  const mark = (className: string) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 220"
      className={`block h-auto w-full ${className}`}
    >
      <text
        x="500"
        y="205"
        textAnchor="middle"
        textLength="990"
        lengthAdjust="spacing"
        fontSize="270"
        fontWeight="700"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {text}
      </text>
    </svg>
  );

  return (
    <div
      aria-hidden="true"
      className="relative mt-6 select-none"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        setSpot({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
          on: true,
        });
      }}
      onPointerLeave={() => setSpot((s) => ({ ...s, on: false }))}
    >
      {mark("fill-[color-mix(in_oklch,var(--foreground)_5%,transparent)]")}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: spot.on ? 1 : 0,
          maskImage: `radial-gradient(circle 10rem at ${spot.x}% ${spot.y}%, black, transparent)`,
          WebkitMaskImage: `radial-gradient(circle 10rem at ${spot.x}% ${spot.y}%, black, transparent)`,
        }}
      >
        {mark("fill-primary")}
      </div>
    </div>
  );
}
