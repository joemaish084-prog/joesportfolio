import { describe, expect, it } from "vitest";
import { BOTTLE_PROFILE, MUG_PROFILE, curvedLabel, latheSurface } from "./mockupGeometry";

describe("mockup surfaces", () => {
  it("closes each revolution and keeps triangle indices within the vertex buffer", () => {
    for (const profile of [MUG_PROFILE, BOTTLE_PROFILE]) {
      const surface = latheSurface(profile, 32);
      const vertices = surface.position.length / 3;
      expect(surface.index.length).toBe((profile.length - 1) * 32 * 6);
      expect(Math.max(...surface.index)).toBeLessThan(vertices);
      for (let row = 0; row < profile.length; row++) {
        const first = row * 33 * 3, last = first + 32 * 3;
        for (let axis = 0; axis < 3; axis++) expect(surface.position[first + axis]).toBeCloseTo(surface.position[last + axis], 5);
      }
      expect([...surface.normal].every(Number.isFinite)).toBe(true);
    }
  });

  it("gives the mug an inward-facing inner wall and an outward-facing exterior", () => {
    const surface = latheSurface(MUG_PROFILE, 8);
    expect(surface.normal[4 * 9 * 3 + 2]).toBeGreaterThan(0);
    expect(surface.normal[8 * 9 * 3 + 2]).toBeLessThan(0);
  });

  it("wraps the decal onto the cylinder and keeps its UVs unmirrored", () => {
    const label = curvedLabel(0.805, 1.1, 0.7, 0.1);
    for (let i = 0; i < label.position.length; i += 3) expect(Math.hypot(label.position[i], label.position[i + 2])).toBeCloseTo(0.805, 5);
    expect(label.position[0]).toBeLessThan(0);
    expect(label.position[40 * 3]).toBeGreaterThan(0);
    expect([...label.uv.slice(0, 2)]).toEqual([0, 0]);
    expect([...label.uv.slice(-2)]).toEqual([1, 1]);
  });

  it("rejects impossible dimensions and resolutions before allocating GPU data", () => {
    expect(() => latheSurface(MUG_PROFILE, 1)).toThrow();
    expect(() => latheSurface([[-1, 0], [1, 1]])).toThrow();
    expect(() => latheSurface(MUG_PROFILE, 100000)).toThrow();
    expect(() => curvedLabel(0, 1, 1)).toThrow();
  });
});
