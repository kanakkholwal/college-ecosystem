import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const floor = s.box(0, 0, 0, 300, 220, 14);
const COLS = 4;
const ROWS = 3;
const FREE = 6;

const rooms = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const h = 24 + ((i * 7) % 3) * 10;
  return { i, b: s.box(14 + col * 71, 14 + row * 68, 14, 58, 54, h), h };
});

const free = rooms[FREE];
const [pinX, pinY] = s.project([
  14 + (FREE % COLS) * 71 + 29,
  14 + 68 + 27,
  14 + free.h + 60,
]);
const [baseX, baseY] = s.project([
  14 + (FREE % COLS) * 71 + 29,
  14 + 68 + 27,
  14 + free.h,
]);

const viewBox = s.viewBox(20);

/** A floor of lecture halls with one free room raised in the brand colour. */
export function RoomFloor({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A floor plan of classrooms with one free room highlighted"
    >
      <FadeMask id="room-floor-fade" />
      <g mask="url(#room-floor-fade)">
        <Solid b={floor} />
        {rooms.map((r) => (
          <Solid key={r.i} b={r.b} accent={r.i === FREE} />
        ))}
      </g>
      <path
        className="dash"
        d={`M${pinX.toFixed(1)} ${(pinY + 12).toFixed(1)}V${baseY.toFixed(1)}`}
      />
      <g
        className="float"
        transform={`translate(${pinX.toFixed(1)} ${pinY.toFixed(1)})`}
      >
        <path
          className="bell-shape"
          d="M0 14c-8-9-13-15-13-22a13 13 0 0 1 26 0c0 7-5 13-13 22z"
        />
        <circle className="check-dot" cx="0" cy="-8" r="4" />
      </g>
      <circle
        className="drop-dot"
        cx={baseX.toFixed(1)}
        cy={baseY.toFixed(1)}
        r="3"
      />
    </svg>
  );
}
