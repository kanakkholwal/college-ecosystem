import type React from "react";
import type { BoxFaces } from "./iso";
import "./iso.css";

export function Solid({
  b,
  accent = false,
  children,
}: {
  b: BoxFaces;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g className="solid">
      <polygon
        className={accent ? "accent-side" : "face-left"}
        points={b.left}
      />
      <polygon
        className={accent ? "accent-side" : "face-right"}
        points={b.right}
      />
      <polygon className={accent ? "accent-top" : "face-top"} points={b.top} />
      {children}
    </g>
  );
}

/** Fades the lower part of a scene into the canvas. */
export function FadeMask({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask id={id} maskContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill={`url(#${id}-g)`} />
      </mask>
    </defs>
  );
}
