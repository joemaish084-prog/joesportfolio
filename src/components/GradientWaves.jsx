import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./GradientWaves.css";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uHeight;
uniform float uFogDepth;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform int uSteps;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float waveHeight(vec2 p) {
  float h = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    h += amp * noise(p * freq + vec2(uTime * 0.35 * freq, uTime * 0.12 * freq));
    amp *= 0.5;
    freq *= 2.1;
  }
  h += 0.25 * sin(p.x * 1.6 + uTime * 0.8);
  return h;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // perspective: distance towards horizon
  float horizon = 0.62;
  float y = uv.y;
  float depth = clamp((horizon - y) / max(horizon, 0.0001), 0.0, 1.0);

  vec3 col = uHorizonColor;
  float alpha = 1.0;

  if (y < horizon) {
    float persp = 1.0 / max(1.0 - depth, 0.06);
    vec2 wp = vec2(p.x * persp * uWaveScale * 3.0, persp * uHeight * 0.35);
    wp += (uMouse - 0.5) * 0.6;

    float h = waveHeight(wp) * uAmplitude;
    float crest = smoothstep(0.85, 1.35, h);
    float body = smoothstep(0.05, 0.9, h);

    vec3 waveCol = mix(uHorizonColor, uWaveColor, body * 0.75);
    waveCol = mix(waveCol, uCrestColor, crest * 0.10);

    float fog = exp(-depth * depth * uFogDepth * 0.35);
    col = mix(uHorizonColor, waveCol, fog * 0.85);
  } else {
    float glow = exp(-(y - horizon) * 5.0);
    col = mix(uHorizonColor, uWaveColor * 0.65, glow * 0.5);
  }

  col *= uBrightness;
  col *= 0.38;

  if (uGrain > 0.5) {
    float g = hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5;
    col += g * uGrainIntensity;
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), alpha * uOpacity);
}
`;

export default function GradientWaves({
  horizonColor = "#1a0800",
  waveColor = "#F97316",
  crestColor = "#ffffff",
  speed = 0.3,
  amplitude = 2.0,
  waveScale = 0.5,
  height = 5.5,
  fogDepth = 12,
  detail = "medium",
  brightness = 0.9,
  opacity = 1.0,
  mouseInteraction = true,
  grain = true,
  grainIntensity = 0.03,
}) {
  const ctnDom = useRef(null);
  const propsRef = useRef({});
  propsRef.current = {
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    height,
    fogDepth,
    brightness,
    opacity,
    mouseInteraction,
    grain,
    grainIntensity,
  };

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const dprCap = detail === "low" ? 1 : detail === "high" ? 2 : 1.5;
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, dprCap),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const toVec = (hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uMouse: { value: [0.5, 0.5] },
        uHorizonColor: { value: toVec(horizonColor) },
        uWaveColor: { value: toVec(waveColor) },
        uCrestColor: { value: toVec(crestColor) },
        uAmplitude: { value: amplitude },
        uWaveScale: { value: waveScale },
        uHeight: { value: height },
        uFogDepth: { value: fogDepth },
        uBrightness: { value: brightness },
        uOpacity: { value: opacity },
        uGrain: { value: grain ? 1 : 0 },
        uGrainIntensity: { value: grainIntensity },
        uSteps: { value: 4 },
      },
    });

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    const resize = () => {
      const w = ctn.offsetWidth;
      const h = ctn.offsetHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w * renderer.dpr, h * renderer.dpr];
    };
    window.addEventListener("resize", resize);
    resize();

    const target = [0.5, 0.5];
    const onMouse = (e) => {
      if (!propsRef.current.mouseInteraction) return;
      const rect = ctn.getBoundingClientRect();
      target[0] = (e.clientX - rect.left) / rect.width;
      target[1] = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = (t) => {
      raf = requestAnimationFrame(update);
      const p = propsRef.current;
      program.uniforms.uTime.value = reduced ? 0 : t * 0.001 * (p.speed ?? 0.3);
      const m = program.uniforms.uMouse.value;
      m[0] += (target[0] - m[0]) * 0.05;
      m[1] += (target[1] - m[1]) * 0.05;
      program.uniforms.uAmplitude.value = p.amplitude;
      program.uniforms.uBrightness.value = p.brightness;
      program.uniforms.uOpacity.value = p.opacity;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnDom} className="gradient-waves-container" />;
}
