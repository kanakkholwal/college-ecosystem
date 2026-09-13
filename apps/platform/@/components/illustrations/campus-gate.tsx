import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const base = s.box(0, 0, 0, 200, 170, 16);
const pillars = [
  s.box(40, 40, 16, 30, 30, 140),
  s.box(130, 40, 16, 30, 30, 140),
];
const lintel = s.box(30, 35, 156, 140, 40, 20);
// Stands in front of the opening (larger y) so it paints over both pillars.
const card = s.box(85, 84, 62, 30, 4, 42);

const [px0, py0] = s.project([100, 96, 16]);
const [px1, py1] = s.project([100, 168, 16]);
const path = `M${px0.toFixed(1)} ${py0.toFixed(1)}L${px1.toFixed(1)} ${py1.toFixed(1)}`;

const viewBox = s.viewBox(24);

/** A campus gate with a college ID card waiting at the entrance: sign in. */
export function CampusGate({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A campus gate with a college ID card floating at its entrance"
    >
      <FadeMask id="campus-gate-fade" />
      <g mask="url(#campus-gate-fade)">
        <Solid b={base} />
        {pillars.map((p) => (
          <Solid key={p.top} b={p} />
        ))}
        <Solid b={lintel} />
      </g>
      <path className="dash" d={path} />
      <g className="float">
        <Solid b={card} accent />
      </g>
    </svg>
  );
}
