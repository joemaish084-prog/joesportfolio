export type ProfilePoint = readonly [radius: number, height: number];

export interface SurfaceData {
  position: Float32Array;
  normal: Float32Array;
  uv: Float32Array;
  index: Uint16Array;
}

/** Revolve a cross-section around Y, including inner walls when present. */
export function latheSurface(profile: readonly ProfilePoint[], segments = 80): SurfaceData {
  if (profile.length < 2 || !Number.isInteger(segments) || segments < 3 || (segments + 1) * profile.length > 65535) {
    throw new Error("Invalid lathe resolution");
  }
  if (profile.some(([radius, y]) => radius < 0 || !Number.isFinite(radius) || !Number.isFinite(y))) {
    throw new Error("Invalid lathe profile");
  }
  const position: number[] = [], normal: number[] = [], uv: number[] = [], index: number[] = [];
  profile.forEach(([radius, y], row) => {
    const before = profile[Math.max(0, row - 1)];
    const after = profile[Math.min(profile.length - 1, row + 1)];
    const dy = after[1] - before[1], dr = after[0] - before[0];
    const length = Math.hypot(dy, dr) || 1;
    for (let i = 0; i <= segments; i++) {
      const angle = i / segments * Math.PI * 2;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      position.push(radius * sin, y, radius * cos);
      normal.push(dy / length * sin, -dr / length, dy / length * cos);
      uv.push(i / segments, row / (profile.length - 1));
      if (row < profile.length - 1 && i < segments) {
        const a = row * (segments + 1) + i, b = a + segments + 1;
        index.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  });
  return { position: new Float32Array(position), normal: new Float32Array(normal), uv: new Float32Array(uv), index: new Uint16Array(index) };
}

/** A narrow curved decal that follows the front of a cylinder without stretching across its back. */
export function curvedLabel(radius: number, width: number, height: number, centerY = 0): SurfaceData {
  if (![radius, width, height, centerY].every(Number.isFinite) || radius <= 0 || width <= 0 || height <= 0) {
    throw new Error("Invalid decal dimensions");
  }
  const segments = 40, position: number[] = [], normal: number[] = [], uv: number[] = [], index: number[] = [];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments - 0.5) * width / radius;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      position.push(radius * sin, centerY + (row - 0.5) * height, radius * cos);
      normal.push(sin, 0, cos);
      uv.push(i / segments, row);
      if (row === 0 && i < segments) index.push(i, i + 1, i + segments + 1, i + 1, i + segments + 2, i + segments + 1);
    }
  }
  return { position: new Float32Array(position), normal: new Float32Array(normal), uv: new Float32Array(uv), index: new Uint16Array(index) };
}

export const MUG_PROFILE: readonly ProfilePoint[] = [
  [0, -0.9], [0.68, -0.9], [0.77, -0.87], [0.8, -0.78], [0.8, 0.8],
  [0.79, 0.87], [0.76, 0.9], [0.73, 0.87], [0.72, 0.8], [0.72, -0.65], [0.65, -0.73], [0, -0.73],
];

export const BOTTLE_PROFILE: readonly ProfilePoint[] = [
  [0, -1.3], [0.48, -1.3], [0.56, -1.27], [0.59, -1.18], [0.59, 0.65],
  [0.58, 0.79], [0.52, 0.91], [0.36, 1.06], [0.28, 1.13], [0.28, 1.24], [0, 1.24],
];
