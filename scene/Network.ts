import * as THREE from "three";
import { GLOW_BLENDING } from "./blending";
import { HUBS, LINKS, cityByName, latLonToVec3, mulberry32 } from "./geo";
import type { SceneState } from "./sceneState";

type RingDef = { radius: number; tilt: number; roll: number; speed: number };

const RING_DEFS: RingDef[] = [
  { radius: 2.9, tilt: 0.38, roll: -0.16, speed: 0.05 },
  { radius: 2.3, tilt: 0.6, roll: 0.25, speed: -0.07 },
  { radius: 1.62, tilt: 1.12, roll: -0.5, speed: 0.09 },
];

/** Screen-space directions for DISCOVER, DESIGN, BUILD anchors + their ring. */
const LABEL_TARGETS: { ring: number; dir: [number, number] }[] = [
  { ring: 0, dir: [0.8, 1] },
  { ring: 0, dir: [-1, -0.55] },
  { ring: 1, dir: [1, 0.08] },
];

const ARC_SEGMENTS = 64;
const RING_SEGMENTS = 320;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const arcVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aArc;
  varying float vT;
  varying float vSeed;
  varying float vArc;
  void main() {
    vT = aT; vSeed = aSeed; vArc = aArc;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uAlpha;
  uniform float uMorph;
  varying float vT;
  varying float vSeed;
  varying float vArc;
  void main() {
    float ends = pow(sin(3.14159 * vT), 0.6);
    float head = fract(uTime * (0.12 + vSeed * 0.08) + vSeed);
    float pulse = smoothstep(0.22, 0.0, abs(vT - head)) ;
    float a = (0.42 + 1.1 * pulse) * ends * uAlpha * vArc;
    vec3 col = mix(vec3(0.25, 0.55, 1.0), vec3(0.55, 0.9, 1.0), pulse);
    gl_FragColor = vec4(col * a, 1.0);
  }
`;

const ringVertex = /* glsl */ `
  attribute float aT;
  uniform float uWorldRadius;
  varying float vT;
  varying float vDepth;
  void main() {
    vT = aT;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vDepth = (mv.z - c.z) / uWorldRadius;
    gl_Position = projectionMatrix * mv;
  }
`;
const ringFragment = /* glsl */ `
  uniform float uDraw;
  uniform float uStart;
  uniform float uAlpha;
  uniform float uTime;
  uniform float uSpeed;
  varying float vT;
  varying float vDepth;
  void main() {
    float p = fract(vT - uStart);
    // Draw outward from the seed point in both directions
    float d = min(p, 1.0 - p) * 2.0;
    float drawn = 1.0 - smoothstep(uDraw - 0.04, uDraw, d);
    float edge = smoothstep(uDraw - 0.08, uDraw, d) * drawn * step(uDraw, 0.999);
    float shimmer = 0.5 + 0.5 * sin(vT * 6.2832 * 2.0 - uTime * uSpeed * 8.0);
    float depth = mix(0.28, 1.0, smoothstep(-0.8, 0.6, vDepth));
    float a = (0.5 + 0.3 * shimmer + edge * 1.4) * drawn * depth * uAlpha;
    vec3 col = mix(vec3(0.2, 0.45, 1.0), vec3(0.5, 0.85, 1.0), edge + shimmer * 0.25);
    gl_FragColor = vec4(col * a, 1.0);
  }
`;

const nodeVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aWarm;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vWarm;
  void main() {
    vAlpha = aAlpha; vWarm = aWarm;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;
const nodeFragment = /* glsl */ `
  varying float vAlpha;
  varying float vWarm;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float halo = pow(1.0 - smoothstep(0.0, 1.0, d), 2.2) * 0.55;
    float core = 1.0 - smoothstep(0.12, 0.3, d);
    vec3 glow = mix(vec3(0.25, 0.55, 1.0), vec3(1.0, 0.7, 0.4), vWarm);
    vec3 col = glow * halo + vec3(0.85, 0.95, 1.0) * core;
    gl_FragColor = vec4(col * vAlpha, 1.0);
  }
`;

type Arc = {
  from: THREE.Vector3[]; // earth-local points
  ring: number;
  start: number;
  span: number;
  delay: number;
};

type Node = {
  local?: THREE.Vector3; // earth-local surface position (hub nodes)
  ring: number;
  angle: number;
  spin: boolean;
  delay: number;
  baseSize: number;
  label?: number;
};

export class Network {
  readonly group = new THREE.Group();
  readonly rings: { def: RingDef; quat: THREE.Quaternion; line: THREE.LineLoop<THREE.BufferGeometry, THREE.ShaderMaterial> }[] = [];
  private arcs: Arc[] = [];
  private nodes: Node[] = [];
  private arcGeo: THREE.BufferGeometry;
  private arcMat: THREE.ShaderMaterial;
  private nodeGeo: THREE.BufferGeometry;
  private nodeMat: THREE.ShaderMaterial;
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();
  private tmpQ = new THREE.Quaternion();
  private tmpE = new THREE.Euler();
  private tmpN = new THREE.Vector3();
  private prev = new THREE.Vector3();
  private baseQuats: THREE.Quaternion[] = [];
  readonly labelAnchors: { ring: number; angle: number }[] = [];

  constructor(opts: { ringCount: number; pixelRatio: number }) {
    const rand = mulberry32(42);
    const ringDefs = RING_DEFS.slice(0, opts.ringCount);

    // ---- Rings ------------------------------------------------------------
    ringDefs.forEach((def) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(def.tilt, 0, def.roll, "ZXY"));
      this.baseQuats.push(q.clone());
      const pos = new Float32Array(RING_SEGMENTS * 3);
      const t = new Float32Array(RING_SEGMENTS);
      for (let i = 0; i < RING_SEGMENTS; i++) {
        const a = (i / RING_SEGMENTS) * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * def.radius;
        pos[i * 3 + 2] = Math.sin(a) * def.radius;
        t[i] = i / RING_SEGMENTS;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aT", new THREE.BufferAttribute(t, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        transparent: true,
        depthWrite: false,
        ...GLOW_BLENDING,
        uniforms: {
          uDraw: { value: 0 },
          uStart: { value: 0 },
          uAlpha: { value: 0 },
          uTime: { value: 0 },
          uSpeed: { value: def.speed },
          uWorldRadius: { value: 1 },
        },
      });
      const line = new THREE.LineLoop(geo, mat);
      line.quaternion.copy(q);
      line.renderOrder = 3;
      this.rings.push({ def, quat: q, line });
      this.group.add(line);
    });

    // ---- Label anchors: pick the ring angle that points toward a screen direction
    for (const target of LABEL_TARGETS) {
      const ring = Math.min(target.ring, ringDefs.length - 1);
      const dir = new THREE.Vector2(...target.dir).normalize();
      let best = 0;
      let bestScore = -Infinity;
      for (let i = 0; i < 360; i++) {
        const a = (i / 360) * Math.PI * 2;
        this.ringPointBase(ring, a, this.tmpA);
        const s = new THREE.Vector2(this.tmpA.x, this.tmpA.y).normalize().dot(dir) + (this.tmpA.z > 0 ? 0.08 : 0);
        if (s > bestScore) {
          bestScore = s;
          best = a;
        }
      }
      this.labelAnchors.push({ ring, angle: best });
    }

    // ---- Arcs (great circles on the globe) ---------------------------------
    const hubVecs = HUBS.map((n) => {
      const c = cityByName(n);
      return latLonToVec3(c.lat, c.lon);
    });
    LINKS.forEach(([a, b], i) => {
      const va = hubVecs[a];
      const vb = hubVecs[b];
      const angle = va.angleTo(vb);
      const lift = 0.025 + angle * 0.09;
      const from: THREE.Vector3[] = [];
      for (let s = 0; s <= ARC_SEGMENTS; s++) {
        const t = s / ARC_SEGMENTS;
        const p = slerpVec(va, vb, t).multiplyScalar(1.004 + Math.sin(Math.PI * t) * lift);
        from.push(p);
      }
      // Each arc owns a slice of an orbit; seed the ring draw from arc 0..R-1
      const ring = i % ringDefs.length;
      this.arcs.push({
        from,
        ring,
        start: (i * 2.399963) % (Math.PI * 2),
        span: 0.55 + rand() * 0.7,
        delay: (i / LINKS.length) * 0.45,
      });
    });

    // ---- Nodes ------------------------------------------------------------
    hubVecs.forEach((v, j) => {
      this.nodes.push({
        local: v.clone().multiplyScalar(1.006),
        ring: j % ringDefs.length,
        angle: (j * 2.399963 + 0.4) % (Math.PI * 2),
        spin: true,
        delay: (j / hubVecs.length) * 0.5,
        baseSize: j === 0 ? 16 : 9 + rand() * 4,
      });
    });
    this.labelAnchors.forEach((a, i) => {
      this.nodes.push({ ring: a.ring, angle: a.angle, spin: false, delay: 0, baseSize: 14, label: i });
    });

    // ---- Buffers ----------------------------------------------------------
    const segCount = this.arcs.length * ARC_SEGMENTS;
    const arcPos = new Float32Array(segCount * 2 * 3);
    const arcT = new Float32Array(segCount * 2);
    const arcSeed = new Float32Array(segCount * 2);
    const arcVis = new Float32Array(segCount * 2).fill(1);
    let o = 0;
    this.arcs.forEach((_, i) => {
      const seed = rand();
      for (let s = 0; s < ARC_SEGMENTS; s++) {
        arcT[o] = s / ARC_SEGMENTS;
        arcT[o + 1] = (s + 1) / ARC_SEGMENTS;
        arcSeed[o] = arcSeed[o + 1] = seed + i * 0.001;
        o += 2;
      }
    });
    this.arcGeo = new THREE.BufferGeometry();
    this.arcGeo.setAttribute("position", new THREE.BufferAttribute(arcPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.arcGeo.setAttribute("aT", new THREE.BufferAttribute(arcT, 1));
    this.arcGeo.setAttribute("aSeed", new THREE.BufferAttribute(arcSeed, 1));
    this.arcGeo.setAttribute("aArc", new THREE.BufferAttribute(arcVis, 1));
    this.arcMat = new THREE.ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      transparent: true,
      depthWrite: false,
      ...GLOW_BLENDING,
      uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uMorph: { value: 0 } },
    });
    const arcLines = new THREE.LineSegments(this.arcGeo, this.arcMat);
    arcLines.frustumCulled = false;
    arcLines.renderOrder = 2;
    this.group.add(arcLines);

    const n = this.nodes.length;
    this.nodeGeo = new THREE.BufferGeometry();
    this.nodeGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage),
    );
    this.nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage));
    this.nodeGeo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage));
    this.nodeGeo.setAttribute("aWarm", new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage));
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      transparent: true,
      depthWrite: false,
      ...GLOW_BLENDING,
      uniforms: { uPixelRatio: { value: opts.pixelRatio } },
    });
    const points = new THREE.Points(this.nodeGeo, this.nodeMat);
    points.frustumCulled = false;
    points.renderOrder = 4;
    this.group.add(points);
  }

  private ringPointBase(k: number, angle: number, out: THREE.Vector3) {
    const def = this.rings[k].def;
    return out.set(Math.cos(angle) * def.radius, 0, Math.sin(angle) * def.radius).applyQuaternion(this.rings[k].quat);
  }

  /** Ring point in system space using the ring's current (wobbling) orientation. */
  ringPoint(k: number, angle: number, out: THREE.Vector3) {
    const def = this.rings[k].def;
    return out.set(Math.cos(angle) * def.radius, 0, Math.sin(angle) * def.radius).applyQuaternion(this.rings[k].line.quaternion);
  }

  update(state: SceneState, time: number, earthQuat: THREE.Quaternion, worldScale: number, ambient: number) {
    // Ring wobble — barely perceptible precession
    this.rings.forEach((r, k) => {
      this.tmpE.set(Math.sin(time * 0.11 + k * 2.1) * 0.025 * ambient, 0, Math.cos(time * 0.09 + k) * 0.02 * ambient);
      this.tmpQ.setFromEuler(this.tmpE);
      r.line.quaternion.copy(this.baseQuats[k]).multiply(this.tmpQ);
      const u = r.line.material.uniforms;
      u.uTime.value = time;
      u.uWorldRadius.value = r.def.radius * worldScale;
      u.uAlpha.value = state.orbitDraw > 0 ? 0.9 : 0;
      // Each ring grows from a different seed, staggered
      const local = clamp01((state.orbitDraw - k * 0.12) / (1 - 0.24));
      u.uDraw.value = smooth(local);
      const seed = this.arcs.find((a) => a.ring === k);
      u.uStart.value = seed ? (seed.start + seed.span / 2) / (Math.PI * 2) : 0;
    });

    const morph = state.morph;

    // ---- Arcs --------------------------------------------------------------
    const pos = this.arcGeo.attributes.position.array as Float32Array;
    let o = 0;
    const p = this.tmpA;
    const q = this.tmpB;
    const prev = this.prev;
    for (const arc of this.arcs) {
      const m = smooth(clamp01((morph - arc.delay) / 0.55));
      for (let s = 0; s <= ARC_SEGMENTS; s++) {
        const t = s / ARC_SEGMENTS;
        p.copy(arc.from[s]).applyQuaternion(earthQuat);
        if (m > 0) {
          this.ringPoint(arc.ring, arc.start + arc.span * t, q);
          const lift = Math.sin(Math.PI * m) * 0.35;
          p.lerp(q, m);
          p.addScaledVector(this.tmpN.copy(p).normalize(), lift);
        }
        if (s > 0) {
          pos[o++] = prev.x;
          pos[o++] = prev.y;
          pos[o++] = prev.z;
          pos[o++] = p.x;
          pos[o++] = p.y;
          pos[o++] = p.z;
        }
        prev.copy(p);
      }
    }
    this.arcGeo.attributes.position.needsUpdate = true;
    this.arcMat.uniforms.uTime.value = time;
    this.arcMat.uniforms.uAlpha.value = state.network * state.introNodes;

    // ---- Nodes -------------------------------------------------------------
    const npos = this.nodeGeo.attributes.position.array as Float32Array;
    const size = this.nodeGeo.attributes.aSize.array as Float32Array;
    const alpha = this.nodeGeo.attributes.aAlpha.array as Float32Array;
    const warm = this.nodeGeo.attributes.aWarm.array as Float32Array;
    this.nodes.forEach((n, i) => {
      const twinkle = 0.8 + 0.2 * Math.sin(time * 1.3 + i * 1.7);
      if (n.label !== undefined) {
        this.ringPoint(n.ring, n.angle, p);
        const h = state.hover[n.label];
        size[i] = n.baseSize * (1 + h * 0.6);
        alpha[i] = state.labels * (0.85 + h * 0.4) * twinkle;
        warm[i] = 0;
      } else {
        const m = smooth(clamp01((morph - n.delay) / 0.5));
        p.copy(n.local!).applyQuaternion(earthQuat);
        if (m > 0) {
          const ang = n.angle + (n.spin ? time * this.rings[n.ring].def.speed * 2 : 0);
          this.ringPoint(n.ring, ang, q);
          const lift = Math.sin(Math.PI * m) * 0.35;
          p.lerp(q, m);
          p.addScaledVector(this.tmpN.copy(p).normalize(), lift);
        }
        // Stagger activation during intro: hubs light one after another
        const intro = clamp01(state.introNodes * 1.6 - n.delay * 1.2);
        size[i] = n.baseSize * (1 - 0.35 * m);
        alpha[i] = intro * twinkle * Math.max(state.network, 0.35);
        warm[i] = (1 - m) * 0.55;
      }
      npos[i * 3] = p.x;
      npos[i * 3 + 1] = p.y;
      npos[i * 3 + 2] = p.z;
    });
    this.nodeGeo.attributes.position.needsUpdate = true;
    this.nodeGeo.attributes.aSize.needsUpdate = true;
    this.nodeGeo.attributes.aAlpha.needsUpdate = true;
    this.nodeGeo.attributes.aWarm.needsUpdate = true;
  }

  setPixelRatio(pr: number) {
    this.nodeMat.uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    this.arcGeo.dispose();
    this.arcMat.dispose();
    this.nodeGeo.dispose();
    this.nodeMat.dispose();
    this.rings.forEach((r) => {
      r.line.geometry.dispose();
      r.line.material.dispose();
    });
  }
}

function slerpVec(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  const angle = a.angleTo(b);
  if (angle < 1e-5) return a.clone();
  const s = Math.sin(angle);
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * angle) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
}
