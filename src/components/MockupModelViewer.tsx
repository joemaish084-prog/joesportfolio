import { useEffect, useRef, useState } from "react";
import { Box, Camera, Color, Cylinder, Geometry, Mesh, Plane, Program, Renderer, Texture, Torus, Transform } from "ogl";
import { Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { BOTTLE_PROFILE, MUG_PROFILE, curvedLabel, latheSurface, type SurfaceData } from "@/lib/mockupGeometry";
import type { MockupModel } from "@/data/mockups";

const vertex = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  varying vec3 vLocal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vUv = uv; vLocal = position; vNormal = normalize(normalMatrix * normal);
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vView = -view.xyz;
    gl_Position = projectionMatrix * view;
  }`;
const fragment = `
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uCup;
  uniform float uTextured;
  uniform float uShadow;
  uniform sampler2D uLogo;
  varying vec3 vNormal;
  varying vec3 vLocal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    if (uShadow > 0.5) {
      float d = length((vUv - 0.5) * 2.0);
      gl_FragColor = vec4(0.08, 0.06, 0.04, 0.23 * exp(-4.5 * d * d));
      return;
    }
    vec3 color = uColor;
    float alpha = 1.0;
    if (uCup > 0.5 && length(vLocal.xz) < 0.738 && vLocal.y > -0.74) color = uAccent;
    if (uTextured > 0.5) {
      vec4 logo = texture2D(uLogo, vUv);
      color = logo.rgb; alpha = logo.a;
      if (alpha < 0.04) discard;
    }
    vec3 n = normalize(vNormal);
    vec3 light = normalize(vec3(-3.0, 5.0, 4.0));
    float diffuse = max(dot(n, light), 0.0);
    float fill = max(dot(n, normalize(vec3(4.0, 1.0, 2.0))), 0.0);
    float spec = pow(max(dot(n, normalize(light + normalize(vView))), 0.0), 65.0);
    gl_FragColor = vec4(color * (0.48 + 0.48 * diffuse + 0.15 * fill) + vec3(0.18 * spec), alpha);
  }`;

const objectNames = { mug: "mug", bottle: "bottle", card: "business card" };

/** Actual WebGL meshes, loaded only when a visitor chooses the 3D view. */
export default function MockupModelViewer({ model, brand, poster }: { model: MockupModel; brand: string; poster: string }) {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<(action: string) => void>(() => {});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false, frame = 0;
    let renderer: Renderer | undefined;
    const geometries: Geometry[] = [], programs: Program[] = [], textures: Texture[] = [];
    let observer: ResizeObserver | undefined;
    let removeEvents = () => {};
    const image = new Image();
    const cleanup = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      removeEvents();
      image.onload = null; image.onerror = null;
      actions.current = () => {};
      if (renderer) {
        const gl = renderer.gl;
        geometries.forEach((geometry) => geometry.remove());
        programs.forEach((program) => program.remove());
        textures.forEach((texture) => gl.deleteTexture(texture.texture));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        renderer.gl.canvas.remove();
      }
    };
    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      const gl = renderer.gl, canvas = gl.canvas;
      gl.clearColor(0, 0, 0, 0);
      canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:grab;outline-offset:-4px";
      canvas.tabIndex = 0;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `Interactive 3D ${brand} ${objectNames[model.kind]}. Drag to rotate, use arrow keys to turn and tilt, plus or minus to zoom, and Home to reset.`);
      container.appendChild(canvas);
      const camera = new Camera(gl, { fov: 35, near: 0.1, far: 50 });
      const scene = new Transform(), object = new Transform();
      object.setParent(scene);
      const texture = new Texture(gl, { generateMipmaps: true });
      textures.push(texture);
      const blank = document.createElement("canvas"); blank.width = blank.height = 2;
      texture.image = blank;
      const material = (hex: string, options: { logo?: boolean; cup?: boolean; shadow?: boolean } = {}) => {
        const program = new Program(gl, {
          vertex, fragment, transparent: !!(options.logo || options.shadow), depthWrite: !options.shadow,
          uniforms: {
            uColor: { value: new Color(hex) }, uAccent: { value: new Color(model.accent) },
            uCup: { value: options.cup ? 1 : 0 }, uLogo: { value: texture },
            uTextured: { value: options.logo ? 1 : 0 }, uShadow: { value: options.shadow ? 1 : 0 },
          },
        });
        programs.push(program);
        if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) throw new Error("3D shader unavailable");
        return program;
      };
      const bodyMaterial = material(model.body, { cup: model.kind === "mug" });
      const accentMaterial = material(model.accent), decalMaterial = material("#ffffff", { logo: true });
      const mesh = (geometry: Geometry, program: Program, parent = object) => {
        geometries.push(geometry);
        const item = new Mesh(gl, { geometry, program }); item.setParent(parent); return item;
      };
      const surface = (data: SurfaceData) => new Geometry(gl, {
        position: { size: 3, data: data.position }, normal: { size: 3, data: data.normal },
        uv: { size: 2, data: data.uv }, index: { data: data.index },
      });
      const squareLogo = model.logoMode === "jm-outline";
      if (model.kind === "mug") {
        mesh(surface(latheSurface(MUG_PROFILE)), bodyMaterial);
        mesh(new Torus(gl, { radius: 0.53, tube: 0.12, radialSegments: 16, tubularSegments: 64 }), material(model.handle ?? model.body)).position.x = 0.97;
        mesh(surface(curvedLabel(0.806, 1.15, squareLogo ? 1.15 : 0.5, 0)), decalMaterial);
      } else if (model.kind === "bottle") {
        mesh(surface(latheSurface(BOTTLE_PROFILE)), bodyMaterial);
        mesh(new Cylinder(gl, { radiusTop: 0.3, radiusBottom: 0.3, height: 0.23, radialSegments: 64 }), accentMaterial).position.y = 1.27;
        mesh(surface(curvedLabel(0.596, 0.95, squareLogo ? 0.95 : 0.4, -0.1)), decalMaterial);
      } else {
        mesh(new Box(gl, { width: 3, height: 1.75, depth: 0.055 }), bodyMaterial);
        mesh(new Box(gl, { width: 3, height: 0.045, depth: 0.06 }), accentMaterial).position.y = -0.75;
        const dimensions = { width: squareLogo ? 1.05 : 2.1, height: squareLogo ? 1.05 : 0.7 };
        mesh(new Plane(gl, dimensions), decalMaterial).position.z = 0.031;
        const back = mesh(new Plane(gl, dimensions), decalMaterial);
        back.position.z = -0.031; back.rotation.y = Math.PI;
      }
      const shadow = mesh(new Plane(gl, { width: 4.8, height: 3.6 }), material("#000000", { shadow: true }), scene);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = model.kind === "bottle" ? -1.34 : -0.95;
      let angleX = 0, angleY = -0.28, zoom = 1;
      const draw = () => {
        frame = 0;
        if (disposed || document.hidden) return;
        const width = container.clientWidth, height = container.clientHeight;
        if (!width || !height) return;
        renderer!.setSize(width, height);
        camera.perspective({ aspect: width / height });
        const distance = 6.4 / Math.min(width / height, 1.2) * zoom;
        camera.position.set(0, 1.7 * zoom, distance); camera.lookAt([0, 0, 0]);
        object.rotation.set(angleX, angleY, 0);
        renderer!.render({ scene, camera });
      };
      const invalidate = () => { if (!disposed && !frame) frame = requestAnimationFrame(draw); };
      const command = (action: string) => {
        if (action === "left") angleY -= 0.3;
        if (action === "right") angleY += 0.3;
        if (action === "up") angleX = Math.max(-0.65, angleX - 0.15);
        if (action === "down") angleX = Math.min(0.65, angleX + 0.15);
        if (action === "in") zoom = Math.max(0.65, zoom - 0.12);
        if (action === "out") zoom = Math.min(1.6, zoom + 0.12);
        if (action === "reset") { angleX = 0; angleY = -0.28; zoom = 1; }
        invalidate();
      };
      actions.current = command;
      let pointer: { id: number; x: number; y: number } | undefined;
      const down = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId); canvas.focus(); canvas.style.cursor = "grabbing";
      };
      const move = (event: PointerEvent) => {
        if (!pointer || pointer.id !== event.pointerId) return;
        angleY += (event.clientX - pointer.x) * 0.008;
        angleX = Math.min(0.65, Math.max(-0.65, angleX + (event.clientY - pointer.y) * 0.005));
        pointer.x = event.clientX; pointer.y = event.clientY; invalidate();
      };
      const up = () => { pointer = undefined; canvas.style.cursor = "grab"; };
      const key = (event: KeyboardEvent) => {
        const mapped: Record<string, string> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", "+": "in", "=": "in", "-": "out", Home: "reset" };
        if (mapped[event.key]) { event.preventDefault(); event.stopPropagation(); command(mapped[event.key]); }
      };
      const contextLost = (event: Event) => { event.preventDefault(); if (!disposed) setFailed(true); };
      canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("lostpointercapture", up);
      canvas.addEventListener("keydown", key); canvas.addEventListener("webglcontextlost", contextLost);
      document.addEventListener("visibilitychange", invalidate);
      removeEvents = () => {
        canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("lostpointercapture", up);
        canvas.removeEventListener("keydown", key); canvas.removeEventListener("webglcontextlost", contextLost);
        document.removeEventListener("visibilitychange", invalidate);
      };
      image.onload = () => {
        if (disposed) return;
        try {
          if (squareLogo) {
            // The existing outline asset has a caption below its mark. Use only the mark.
            const logo = document.createElement("canvas"); logo.width = logo.height = 512;
            const context = logo.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");
            context.drawImage(image, 78, 57, 265, 265, 0, 0, 512, 512);
            const pixels = context.getImageData(0, 0, 512, 512);
            for (let i = 0; i < pixels.data.length; i += 4) pixels.data[i + 3] = Math.min(255, Math.max(0, (pixels.data[i] - pixels.data[i + 2] - 25) * 2));
            context.putImageData(pixels, 0, 0); texture.image = logo;
          } else texture.image = image;
          texture.needsUpdate = true; invalidate();
        } catch { setFailed(true); }
      };
      image.onerror = () => { if (!disposed) setFailed(true); };
      image.src = model.logo;
      observer = new ResizeObserver(invalidate); observer.observe(container); invalidate();
    } catch { setFailed(true); }
    return cleanup;
  }, [model, brand]);

  if (failed) return <div className="bg-muted/30"><img src={poster} alt={`${brand} ${objectNames[model.kind]} concept`} className="max-h-[52dvh] w-full object-contain" /><p role="status" className="p-4 text-center text-sm text-muted-foreground">3D is unavailable on this device. You can still explore the photo.</p></div>;
  return (
    <div className="bg-[#e9e3d9] text-[#24211e]">
      <div ref={host} className="h-[min(48dvh,430px)] min-h-60" />
      <div className="flex flex-wrap justify-center gap-2 px-3 pb-3" role="group" aria-label="3D model controls">
        {[
          { action: "left", label: "Rotate left", icon: RotateCcw }, { action: "right", label: "Rotate right", icon: RotateCw },
          { action: "in", label: "Zoom in", icon: Plus }, { action: "out", label: "Zoom out", icon: Minus },
        ].map(({ action, label, icon: Icon }) => <button key={action} type="button" onClick={() => actions.current(action)} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/20 bg-white/70 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"><Icon className="h-4 w-4" /></button>)}
        <button type="button" onClick={() => actions.current("reset")} className="min-h-11 rounded-full border border-black/20 bg-white/70 px-4 text-sm font-semibold hover:bg-white">Reset view</button>
      </div>
      <p className="px-4 pb-4 text-center text-xs leading-relaxed text-black/65">Drag to rotate · Arrow keys to turn and tilt · Concept {objectNames[model.kind]}</p>
    </div>
  );
}
