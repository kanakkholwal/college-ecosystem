import { createScene, type V } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const base = s.box(0, 0, 0, 200, 150, 14);
const lower = s.box(18, 14, 14, 164, 122, 24);
const middle = s.box(30, 22, 38, 140, 106, 22);
const top = s.box(42, 30, 60, 116, 90, 14);
const bookmark = s.box(150, -24, 118, 36, 36, 8);

const segment = (a: V, b: V) => {
  const [ax, ay] = s.project(a);
  const [bx, by] = s.project(b);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`;
};

const lowerPages = [22, 30]
  .map((z) => segment([22, 136, z], [178, 136, z]))
  .join("");
const middlePages = [45, 52]
  .map((z) => segment([34, 128, z], [166, 128, z]))
  .join("");

const viewBox = s.viewBox(24);

/** Stacked course books with an open syllabus on top and a teal bookmark floating above. */
export function CourseBooks({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A stack of course books with an open syllabus on top and a bookmark above it"
    >
      <FadeMask id="course-books-fade" />
      <g mask="url(#course-books-fade)">
        <Solid b={base} />
        <Solid b={lower}>
          <path className="line" d={lowerPages} />
        </Solid>
      </g>
      <Solid b={middle}>
        <path className="line" d={middlePages} />
      </Solid>
      <Solid b={top}>
        <g transform={s.plane(74)} className="decal">
          <path d="M100 36V114" />
          <path d="M54 50h34M54 62h26M54 74h30M112 50h34M112 62h24M112 74h30" />
        </g>
      </Solid>
      <g className="float">
        <Solid b={bookmark} accent />
      </g>
    </svg>
  );
}
