import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const U = 56;
const GAP = 4;
const BASE = 16;
const LEVELS = 4;
const MISSING = { x: 1, y: 1, z: 2 };

const base = s.box(-14, -14, 0, 2 * U + 28, 2 * U + 28, BASE);
const cell = (x: number, y: number, z: number) =>
  s.box(
    x * U + GAP / 2,
    y * U + GAP / 2,
    BASE + z * U,
    U - GAP,
    U - GAP,
    U - GAP
  );

// Unit cubes paint correctly back to front by ascending x + y + z.
const cells = Array.from({ length: 4 * LEVELS }, (_, i) => ({
  x: i % 2,
  y: Math.floor(i / 2) % 2,
  z: Math.floor(i / 4),
}))
  .sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z))
  .map((c) => ({
    ...c,
    key: `${c.x}-${c.y}-${c.z}`,
    missing: c.x === MISSING.x && c.y === MISSING.y && c.z === MISSING.z,
    b: cell(c.x, c.y, c.z),
  }));

// The hole sits on the front corner, so no solid ever paints over its outline.
const hole = cells.find((c) => c.missing);
const lost = s.box(
  2 * U + 36,
  -U / 2,
  BASE + 2.6 * U,
  U - GAP,
  U - GAP,
  U - GAP
);

const viewBox = s.viewBox(24);

/** A block pillar with one block missing, its outline dashed, the block drifting beside it. */
export function LostBlock({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A pillar of blocks with one block missing and floating away beside it"
    >
      <FadeMask id="lost-block-fade" />
      <g mask="url(#lost-block-fade)">
        <Solid b={base} />
        {cells
          .filter((c) => !c.missing)
          .map((c) => (
            <Solid key={c.key} b={c.b} />
          ))}
      </g>
      {hole && (
        <g>
          <polygon className="dash" points={hole.b.left} />
          <polygon className="dash" points={hole.b.right} />
        </g>
      )}
      <g className="float">
        <Solid b={lost} accent />
      </g>
    </svg>
  );
}
