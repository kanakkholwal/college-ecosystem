import { createScene } from "./iso";
import { Solid } from "./solid";

const s = createScene();

const SIZE = 150;
const levels = [230, 115, 0];
const slabs = levels.map((z) => s.box(0, 0, z, SIZE, SIZE, 26));

const connectors = [
  [0, 0],
  [SIZE, 0],
  [SIZE, SIZE],
  [0, SIZE],
].map(([x, y]) => {
  const [ax, ay] = s.project([x, y, 256]);
  const [bx, by] = s.project([x, y, 26]);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}V${by.toFixed(1)}M${bx.toFixed(1)} ${by.toFixed(1)}`;
});

const viewBox = s.viewBox(16);

/** Results, schedules and rooms as three slabs of one stack. Decals sit on each slab's top. */
export function StackedSlabs({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="Results, timetable and classrooms stacked as layers of one platform"
    >
      {connectors.map((d) => (
        <path key={d} className="dash" d={d} />
      ))}
      {slabs.map((b, i) => (
        <g key={levels[i]} className={`float float-${i + 1}`}>
          <Solid b={b}>
            <g transform={s.plane(levels[i] + 26)} className="decal">
              {i === 0 && (
                <>
                  <rect x="48" y="40" width="54" height="68" rx="6" />
                  <path d="M60 58h30M60 70h22M60 82h26" />
                  <path className="accent-line" d="M84 94l6 6 10-12" />
                </>
              )}
              {i === 1 && (
                <>
                  <rect x="40" y="46" width="70" height="58" rx="6" />
                  <path d="M40 62h70M58 40v12M92 40v12" />
                  <rect
                    className="accent-line"
                    x="72"
                    y="74"
                    width="14"
                    height="12"
                    rx="2"
                  />
                </>
              )}
              {i === 2 && (
                <>
                  <path d="M40 104V58l35-18 35 18v46" />
                  <path d="M58 104V80h34v24" />
                  <path className="accent-line" d="M68 92h14" />
                </>
              )}
            </g>
          </Solid>
        </g>
      ))}
    </svg>
  );
}
