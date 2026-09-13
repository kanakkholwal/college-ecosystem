import { createScene } from "./iso";
import { FadeMask, Solid } from "./solid";

const s = createScene();

const base = s.box(0, 0, 0, 200, 200, 18);
const body = s.box(40, 40, 18, 120, 120, 100);
const ballot = s.box(70, 97, 138, 60, 6, 56);
const tally = s.box(-52, 128, 18, 56, 38, 6);

const viewBox = s.viewBox(24);

/** A ballot box with a teal ballot above its slot: community polls. */
export function BallotBox({ className }: { className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={`iso block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label="A ballot box with a ballot dropping into its slot"
    >
      <FadeMask id="ballot-box-fade" />
      <g mask="url(#ballot-box-fade)">
        <Solid b={base} />
        <Solid b={body}>
          <g transform={s.plane(118)} className="decal">
            <path d="M64 92H136V108H64Z" />
          </g>
        </Solid>
      </g>
      <Solid b={tally}>
        <g transform={s.plane(24)} className="decal">
          <path d="M-42 138V156M-34 138V156M-26 138V156M-18 138V156M-46 152L-12 142" />
        </g>
      </Solid>
      <g className="float">
        <Solid b={ballot} accent />
      </g>
    </svg>
  );
}
