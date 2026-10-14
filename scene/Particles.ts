import * as THREE from "three";
import { GLOW_BLENDING } from "./blending";
import { mulberry32 } from "./geo";

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDrift;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.02 + aPhase) * uDrift;
    p.y += cos(uTime * 0.017 + aPhase * 1.3) * uDrift;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.4 + fract(aPhase) * 0.9) + aPhase * 6.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;
const starFragment = /* glsl */ `
  uniform float uAlpha;
  uniform vec3 uColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = pow(1.0 - smoothstep(0.0, 1.0, d), 1.8);
    gl_FragColor = vec4(uColor * a * vTwinkle * uAlpha, 1.0);
  }
`;

function makeField(opts: {
  count: number;
  seed: number;
  box: [number, number, number, number, number, number];
  size: [number, number];
  color: THREE.Color;
  drift: number;
  pixelRatio: number;
}) {
  const rand = mulberry32(opts.seed);
  const pos = new Float32Array(opts.count * 3);
  const size = new Float32Array(opts.count);
  const phase = new Float32Array(opts.count);
  const [x0, x1, y0, y1, z0, z1] = opts.box;
  for (let i = 0; i < opts.count; i++) {
    pos[i * 3] = x0 + rand() * (x1 - x0);
    pos[i * 3 + 1] = y0 + rand() * (y1 - y0);
    pos[i * 3 + 2] = z0 + rand() * (z1 - z0);
    // Mostly tiny, a few brighter
    const r = rand();
    size[i] = opts.size[0] + Math.pow(r, 4) * (opts.size[1] - opts.size[0]);
    phase[i] = rand() * 100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    transparent: true,
    depthWrite: false,
    ...GLOW_BLENDING,
    uniforms: {
      uTime: { value: 0 },
      uAlpha: { value: 0 },
      uPixelRatio: { value: opts.pixelRatio },
      uDrift: { value: opts.drift },
      uColor: { value: opts.color },
    },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

export class Particles {
  readonly stars: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  readonly dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  constructor(opts: { mobile: boolean; pixelRatio: number; reduced: boolean }) {
    this.stars = makeField({
      count: opts.mobile ? 600 : 1600,
      seed: 3,
      box: [-110, 110, -65, 65, -140, -40],
      size: [0.8, 3.2],
      color: new THREE.Color(0.75, 0.85, 1.0),
      drift: opts.reduced ? 0 : 0.6,
      pixelRatio: opts.pixelRatio,
    });
    this.dust = makeField({
      count: opts.mobile ? 90 : 220,
      seed: 11,
      box: [-16, 16, -9, 9, -10, 12],
      size: [1.0, 2.6],
      color: new THREE.Color(0.35, 0.6, 1.0),
      drift: opts.reduced ? 0 : 0.9,
      pixelRatio: opts.pixelRatio,
    });
  }

  update(time: number, stars: number, dust: number) {
    this.stars.material.uniforms.uTime.value = time;
    this.stars.material.uniforms.uAlpha.value = stars;
    this.dust.material.uniforms.uTime.value = time;
    this.dust.material.uniforms.uAlpha.value = dust;
  }

  setPixelRatio(pr: number) {
    this.stars.material.uniforms.uPixelRatio.value = pr;
    this.dust.material.uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    for (const p of [this.stars, this.dust]) {
      p.geometry.dispose();
      p.material.dispose();
    }
  }
}
