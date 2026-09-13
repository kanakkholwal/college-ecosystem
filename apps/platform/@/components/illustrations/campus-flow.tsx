import type React from "react";
import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const noticePillar = s.box(0, 0, 0, 90, 90, 230);
const inputDoc = s.box(18, 14, 230, 54, 62, 3);
const inRamp = s.ramp(90, 205, 24, 66, 224, 152);
const campus = s.box(190, -10, 0, 200, 200, 150);
const hall = s.box(235, 30, 150, 110, 110, 46);
const tile = s.box(204, 148, 150, 48, 26, 6);
const slot = s.box(262, 156, 150, 104, 12, 3);
const outRamp = s.ramp(390, 474, 58, 100, 150, 101);
const studentPillar = s.box(470, 36, 0, 92, 92, 100);
const outputDoc = s.box(489, 52, 100, 54, 60, 3);

const toCampus = s.delta([45, 45, 233], [210, 45, 155]);
const toStudent = s.delta([380, 82, 153], [516, 82, 103]);

const [bellX, bellY] = s.project([420, -40, 300]);
const [dropX, dropY] = s.project([420, -40, 196]);
s.project([420, -40, 340]);

const viewBox = s.viewBox();

/** Hero art: a notice becomes a result sheet on a student's device. */
export function CampusFlow({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A result sheet travelling from the notice board, through the campus, to a student's device"
    >
      <FadeMask id="campus-flow-fade" />
      <g mask="url(#campus-flow-fade)">
        <Solid b={noticePillar} />
        <Solid b={campus} />
        <g className="solid">
          <polygon className="face-right" points={inRamp.side} />
          <polygon className="face-top" points={inRamp.top} />
          <path className="hatch" d={inRamp.hatch} />
        </g>
        <Solid b={hall}>
          <g transform={s.plane(196)} className="decal glow">
            <path d="M270 88l20-10 20 10-20 10z" />
            <path d="M278 92v9c0 3 6 6 12 6s12-3 12-6v-9" />
            <path d="M310 88v12" />
          </g>
        </Solid>
        <g className="solid">
          <Solid b={tile} accent />
          <text transform={s.plane(156)} x="216" y="165" className="tile-label">
            NITH
          </text>
        </g>
        <Solid b={slot} />
        <Solid b={studentPillar} />
        <g className="solid">
          <polygon className="face-right" points={outRamp.side} />
          <polygon className="face-top" points={outRamp.top} />
          <path className="hatch" d={outRamp.hatch} />
        </g>
      </g>

      <g
        className="solid doc doc-in"
        style={
          { "--dx": toCampus.x, "--dy": toCampus.y } as React.CSSProperties
        }
      >
        <polygon className="face-left" points={inputDoc.left} />
        <polygon className="face-right" points={inputDoc.right} />
        <polygon className="face-top" points={inputDoc.top} />
        <g transform={s.plane(233)} className="decal">
          <path d="M26 24h26M26 34h38M26 42h30M26 50h36M26 58h22" />
        </g>
      </g>

      <g
        className="solid doc doc-out"
        style={
          { "--dx": toStudent.x, "--dy": toStudent.y } as React.CSSProperties
        }
      >
        <polygon className="face-left" points={outputDoc.left} />
        <polygon className="face-right" points={outputDoc.right} />
        <polygon className="face-top" points={outputDoc.top} />
        <g transform={s.plane(103)} className="decal">
          <path d="M497 62h26M497 72h38M497 80h30M497 88h36" />
          <circle className="check-dot" cx="528" cy="100" r="7" />
          <path className="check-mark" d="M524.5 100l2.5 2.5 4.5-5" />
        </g>
      </g>

      <g transform={`translate(${bellX.toFixed(1)} ${bellY.toFixed(1)})`}>
        <path
          className="bell-shape"
          d="M-16 8h32c-4-4-6-9-6-16v-6a10 10 0 0 0-20 0v6c0 7-2 12-6 16z"
        />
        <path className="line" d="M-5 12a5 5 0 0 0 10 0" />
      </g>
      <path
        className="drop"
        d={`M${bellX.toFixed(1)} ${(bellY + 22).toFixed(1)}V${dropY.toFixed(1)}`}
      />
      <circle
        className="drop-dot"
        cx={dropX.toFixed(1)}
        cy={dropY.toFixed(1)}
        r="3.5"
      />
    </svg>
  );
}
