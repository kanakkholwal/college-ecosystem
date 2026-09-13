export type V = [number, number, number];
export type BoxFaces = { top: string; left: string; right: string };

const C = Math.cos(Math.PI / 6);
const S = 0.5;

/** 30° isometric projection that tracks the drawn extent so each scene can size its own viewBox. */
export function createScene() {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  function project([x, y, z]: V): [number, number] {
    const sx = (x - y) * C;
    const sy = (x + y) * S - z;
    bounds.minX = Math.min(bounds.minX, sx);
    bounds.maxX = Math.max(bounds.maxX, sx);
    bounds.minY = Math.min(bounds.minY, sy);
    bounds.maxY = Math.max(bounds.maxY, sy);
    return [sx, sy];
  }

  const poly = (vs: V[]) =>
    vs
      .map((v) =>
        project(v)
          .map((n) => n.toFixed(1))
          .join(",")
      )
      .join(" ");

  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number
  ): BoxFaces {
    return {
      top: poly([
        [x, y, z + h],
        [x + w, y, z + h],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ]),
      right: poly([
        [x + w, y, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x + w, y, z + h],
      ]),
      left: poly([
        [x, y + d, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ]),
    };
  }

  function ramp(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number
  ) {
    const zAt = (x: number) => z0 + ((x - x0) / (x1 - x0)) * (z1 - z0);
    const hatch: string[] = [];
    for (let x = x0 + 5; x < x1 - 2; x += 7) {
      const [ax, ay] = project([x, y0 + 5, zAt(x)]);
      const [bx, by] = project([x, y1 - 5, zAt(x)]);
      hatch.push(
        `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`
      );
    }
    return {
      top: poly([
        [x0, y0, z0],
        [x1, y0, z1],
        [x1, y1, z1],
        [x0, y1, z0],
      ]),
      side: poly([
        [x0, y1, z0],
        [x1, y1, z1],
        [x1, y1, z1 - 7],
        [x0, y1, z0 - 7],
      ]),
      hatch: hatch.join(""),
    };
  }

  /** Maps flat 2D decal coordinates onto the plane at height z. */
  const plane = (z: number) => `matrix(${C} ${S} ${-C} ${S} 0 ${-z})`;

  function delta(from: V, to: V) {
    const [ax, ay] = project(from);
    const [bx, by] = project(to);
    return { x: `${(bx - ax).toFixed(1)}px`, y: `${(by - ay).toFixed(1)}px` };
  }

  function viewBox(pad = 24) {
    return [
      bounds.minX - pad,
      bounds.minY - pad,
      bounds.maxX - bounds.minX + pad * 2,
      bounds.maxY - bounds.minY + pad * 2,
    ]
      .map((n) => n.toFixed(1))
      .join(" ");
  }

  return { project, poly, box, ramp, plane, delta, viewBox };
}
