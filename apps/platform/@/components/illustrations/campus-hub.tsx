import { createScene, type V } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();
const f = (n: number) => n.toFixed(1);

type Rect = { x: number; y: number; w: number; h: number };

/** A grid of windows in face space (v runs up), so rows stack from the ground. */
function windowGrid(
  cols: number,
  rows: number,
  w: number,
  h: number,
  gapU: number,
  gapV: number,
  offU: number,
  offV: number
): Rect[] {
  const out: Rect[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      out.push({ x: offU + c * (w + gapU), y: offV + r * (h + gapV), w, h });
    }
  }
  return out;
}

const plaza = s.box(-20, -20, -14, 500, 400, 14);
const walkway = [
  [130, 140, 130, 175, 240, 175, 240, 215, 300, 215],
  [350, 125, 350, 175, 240, 175],
].map((pts) => {
  const points: string[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    points.push(
      s
        .project([pts[i], pts[i + 1], 0])
        .map(f)
        .join(" ")
    );
  }
  return `M${points.join("L")}`;
});

const hall = s.box(30, 20, 0, 200, 110, 110);
const hallLeft = s.leftFace(30, 130, 0);
const hallRight = s.rightFace(230, 20, 0);
const hallLeftWindows = windowGrid(6, 3, 18, 16, 13, 14, 14, 18);
const hallRightWindows = windowGrid(3, 3, 18, 16, 14, 14, 14, 18);

const tower = s.box(105, 50, 110, 50, 50, 80);
const towerRoof = s.pyramid(100, 45, 190, 60, 60, 48);
const towerLeft = s.leftFace(105, 100, 110);
const towerRight = s.rightFace(155, 50, 110);

const library = s.box(280, 20, 0, 140, 90, 58);
const columns = Array.from({ length: 6 }, (_, i) =>
  s.box(286 + i * 24, 112, 0, 8, 8, 58)
);
const entablature = s.box(272, 12, 58, 156, 108, 10);
const libraryRoof = s.pyramid(272, 12, 68, 156, 108, 22);
const libraryRight = s.rightFace(420, 20, 0);

const hostel = s.box(20, 190, 0, 110, 150, 150);
const hostelRight = s.rightFace(130, 190, 0);
const hostelLeft = s.leftFace(20, 340, 0);
const hostelRightWindows = windowGrid(5, 5, 16, 14, 12, 13, 12, 14);
const hostelLeftWindows = windowGrid(3, 5, 16, 14, 14, 13, 13, 14);
const hostelRoof = s.box(14, 184, 150, 122, 162, 8);

function tree(x: number, y: number, h: number, r: number) {
  const [cx, cy] = s.project([x, y, h + r * 0.9]);
  return { trunk: s.box(x - 3, y - 3, 0, 6, 6, h), cx, cy, r };
}
const trees = [
  tree(252, 36, 22, 17),
  tree(465, 320, 22, 17),
  tree(205, 300, 24, 18),
];

const phone = s.box(318, 232, 0, 18, 112, 196);
const phoneScreen = s.rightFace(336, 232, 0);

const phoneTop = s.project([327, 250, 196]);
const tether = (from: V) => {
  const [fx, fy] = s.project(from);
  const [tx, ty] = phoneTop;
  return `M${f(fx)} ${f(fy)}Q${f((fx + tx) / 2)} ${f(Math.min(fy, ty) - 30)} ${f(tx)} ${f(ty)}`;
};
const tethers = [
  tether([323, -41, 200]),
  tether([-18, 172, 210]),
  tether([470, 78, 150]),
];

const resultSheet = s.box(300, -70, 200, 46, 58, 3);
const calendar = s.box(-40, 150, 210, 44, 44, 3);
const [bellX, bellY] = s.project([470, 78, 150]);
const [dotX, dotY] = s.project([327, 236, 188]);

s.project([-40, 150, 240]);
s.project([300, -70, 240]);
const viewBox = s.viewBox();

/** Landing hero: the campus's buildings and modules all feeding one phone. Motion stops under reduced motion. */
export function CampusHub({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="An isometric campus with an academic hall, hostel and library. A timetable, a result sheet and an announcement bell float above it and flow into one phone."
    >
      <FadeMask id="campus-hub-fade" />

      <g mask="url(#campus-hub-fade)">
        <Solid b={plaza} />
        {walkway.map((d) => (
          <path key={d} className="dash" d={d} />
        ))}

        <Solid b={hall}>
          <g className="decal decal-fill" transform={hallLeft}>
            {hallLeftWindows.map((w) => (
              <rect
                key={`hl-${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={w.w}
                height={w.h}
                rx="1.5"
              />
            ))}
            <rect x="88" y="0" width="24" height="30" rx="2" />
          </g>
          <g className="decal decal-fill" transform={hallRight}>
            {hallRightWindows.map((w) => (
              <rect
                key={`hr-${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={w.w}
                height={w.h}
                rx="1.5"
              />
            ))}
          </g>
        </Solid>

        <Solid b={tower}>
          <g className="decal decal-fill" transform={towerLeft}>
            <circle cx="25" cy="48" r="13" />
            <path d="M25 48V58M25 48L32 44" />
          </g>
          <g className="decal decal-fill" transform={towerRight}>
            <rect x="18" y="12" width="14" height="22" rx="7" />
          </g>
        </Solid>
        <g className="solid">
          <polygon className="face-left" points={towerRoof.left} />
          <polygon className="accent-top" points={towerRoof.right} />
        </g>

        {trees.slice(0, 1).map((t) => (
          <g key={`tree-${t.cx}`}>
            <Solid b={t.trunk} />
            <circle className="tree" cx={f(t.cx)} cy={f(t.cy)} r={t.r} />
          </g>
        ))}

        <Solid b={library}>
          <g className="decal decal-fill" transform={libraryRight}>
            <rect x="30" y="0" width="30" height="40" rx="3" />
          </g>
        </Solid>
        {columns.map((c) => (
          <Solid key={c.top} b={c} />
        ))}
        <Solid b={entablature} />
        <g className="solid">
          <polygon className="face-left" points={libraryRoof.left} />
          <polygon className="face-right" points={libraryRoof.right} />
        </g>

        <Solid b={hostel}>
          <g className="decal decal-fill" transform={hostelRight}>
            {hostelRightWindows.map((w) => (
              <rect
                key={`hsr-${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={w.w}
                height={w.h}
                rx="1.5"
              />
            ))}
          </g>
          <g className="decal decal-fill" transform={hostelLeft}>
            {hostelLeftWindows.map((w) => (
              <rect
                key={`hsl-${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={w.w}
                height={w.h}
                rx="1.5"
              />
            ))}
          </g>
        </Solid>
        <Solid b={hostelRoof} />

        {trees.slice(1).map((t) => (
          <g key={`tree-${t.cx}`}>
            <Solid b={t.trunk} />
            <circle className="tree" cx={f(t.cx)} cy={f(t.cy)} r={t.r} />
          </g>
        ))}

        <Solid b={phone}>
          <g className="decal screen" transform={phoneScreen}>
            <rect x="7" y="8" width="98" height="180" rx="12" />
            <rect
              className="accent-fill"
              x="18"
              y="140"
              width="34"
              height="34"
              rx="7"
            />
            <rect x="60" y="140" width="34" height="34" rx="7" />
            <rect x="18" y="98" width="34" height="34" rx="7" />
            <rect x="60" y="98" width="34" height="34" rx="7" />
            <rect x="18" y="56" width="76" height="34" rx="7" />
            <path d="M40 22h32" />
          </g>
        </Solid>
      </g>

      {tethers.map((d) => (
        <path key={d} className="dash flow" d={d} />
      ))}

      <g className="float">
        <Solid b={resultSheet}>
          <g className="decal" transform={s.plane(203)}>
            <path d="M308 -60h24M308 -51h32M308 -43h26M308 -35h30" />
            <circle className="accent-fill" cx="336" cy="-23" r="5" />
          </g>
        </Solid>
      </g>

      <g className="float float-2">
        <Solid b={calendar}>
          <g className="decal decal-fill" transform={s.plane(213)}>
            <rect x="-34" y="158" width="32" height="30" rx="3" />
            <path d="M-34 167h32M-26 154v8M-10 154v8" />
            <rect
              className="accent-fill"
              x="-22"
              y="173"
              width="8"
              height="8"
              rx="1.5"
            />
          </g>
        </Solid>
      </g>

      <g
        className="float float-3"
        transform={`translate(${f(bellX)} ${f(bellY - 10)})`}
      >
        <path
          className="bell-shape"
          d="M-14 7h28c-3.5-3.5-5-8-5-14v-5a9 9 0 0 0-18 0v5c0 6-1.5 10.5-5 14z"
        />
        <path className="line" d="M-4 11a4 4 0 0 0 8 0" />
      </g>

      <circle className="accent-fill notify" cx={f(dotX)} cy={f(dotY)} r="6" />
    </svg>
  );
}
