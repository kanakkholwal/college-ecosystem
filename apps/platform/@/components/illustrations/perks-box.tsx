import { createScene, type V } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const base = s.box(0, 0, 0, 200, 200, 18);
const body = s.box(45, 45, 18, 110, 110, 90);
const lid = s.box(38, 38, 108, 124, 124, 22);
const tag = s.box(158, -28, 156, 44, 44, 10);
const card = s.box(-46, 118, 124, 56, 36, 6);

const segment = (a: V, b: V) => {
  const [ax, ay] = s.project(a);
  const [bx, by] = s.project(b);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`;
};

const bodyRibbon = [94, 106]
  .flatMap((t) => [
    segment([155, t, 18], [155, t, 108]),
    segment([t, 155, 18], [t, 155, 108]),
  ])
  .join("");

const lidRibbon = [94, 106]
  .flatMap((t) => [
    segment([162, t, 108], [162, t, 130]),
    segment([t, 162, 108], [t, 162, 130]),
  ])
  .join("");

const viewBox = s.viewBox(24);

/** A wrapped gift on a platform with a teal perk tag floating above: student benefits. */
export function PerksBox({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A wrapped gift box with a perk tag floating above it"
    >
      <FadeMask id="perks-box-fade" />
      <g mask="url(#perks-box-fade)">
        <Solid b={base} />
        <Solid b={body}>
          <path className="line" d={bodyRibbon} />
        </Solid>
      </g>
      <Solid b={lid}>
        <path className="line" d={lidRibbon} />
        <g transform={s.plane(130)} className="decal">
          <path d="M94 38V162M106 38V162M38 94H162M38 106H162" />
          <path d="M100 100C90 78 68 82 78 100ZM100 100C122 90 118 68 100 78Z" />
        </g>
      </Solid>
      <g className="float float-2">
        <Solid b={card}>
          <g transform={s.plane(130)} className="decal">
            <path d="M-36 128H0M-36 138H-12" />
          </g>
        </Solid>
      </g>
      <g className="float">
        <Solid b={tag} accent />
      </g>
    </svg>
  );
}
