import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const base = s.box(0, 0, 0, 150, 150, 24);
const shaft = s.box(55, 55, 24, 40, 40, 170);
const cap = s.box(45, 45, 194, 60, 60, 16);
const beacon = s.box(62, 62, 210, 26, 26, 12);
const huts = [s.box(190, 10, 0, 70, 60, 50), s.box(200, 110, 0, 60, 70, 70)];

const [cx, cy] = s.project([75, 75, 240]);
const arcs = [34, 58, 82].map(
  (r) =>
    `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r} ${r * 0.6} 0 0 1 ${(r * 2).toFixed(1)} 0`
);
s.project([75, 75, 330]);

const viewBox = s.viewBox(24);

/** A campus tower broadcasting to nearby blocks: announcements and community. */
export function SignalTower({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A campus tower broadcasting announcements to nearby buildings"
    >
      <FadeMask id="signal-tower-fade" />
      <g mask="url(#signal-tower-fade)">
        <Solid b={base} />
        {huts.map((h) => (
          <Solid key={h.top} b={h} />
        ))}
        <Solid b={shaft} />
      </g>
      <Solid b={cap} />
      <Solid b={beacon} accent />
      {arcs.map((d, i) => (
        <path
          key={d}
          className={
            i === 0 ? "accent-line pulse" : `line pulse pulse-${i + 1}`
          }
          d={d}
        />
      ))}
    </svg>
  );
}
