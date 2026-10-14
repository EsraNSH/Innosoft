import * as THREE from "three";
import { GLOW_BLENDING } from "./blending";

const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const earthFragment = /* glsl */ `
  uniform sampler2D uLand;
  uniform sampler2D uLights;
  uniform float uReveal;
  uniform float uSurface;
  uniform float uCity;
  uniform float uDigital;
  uniform float uGlow;
  uniform float uTime;
  uniform vec3 uLightDir;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float rim = 1.0 - ndv;

    float land = texture2D(uLand, vUv).r;
    float lights = texture2D(uLights, vUv).r;

    // ---- Night earth -------------------------------------------------------
    float sun = dot(N, uLightDir);
    float twilight = smoothstep(-0.2, 0.9, sun);
    vec3 ocean = vec3(0.003, 0.007, 0.018);
    vec3 ground = vec3(0.016, 0.024, 0.042);
    vec3 earth = mix(ocean, ground, land);
    earth += vec3(0.01, 0.04, 0.12) * twilight * (0.3 + 0.7 * land);
    earth *= uSurface;
    vec3 city = vec3(1.0, 0.66, 0.32) * lights * 1.25 + vec3(1.0, 0.92, 0.78) * pow(lights, 2.5) * 0.9;
    earth += city * uCity * (1.0 - 0.5 * twilight);
    // Inner atmospheric scattering at the limb
    earth += vec3(0.1, 0.32, 1.0) * pow(rim, 4.5) * (0.5 + 1.1 * twilight);
    earth += vec3(0.6, 0.85, 1.0) * pow(rim, 12.0) * (0.25 + 1.4 * twilight);

    // ---- Digital sphere ----------------------------------------------------
    vec2 grid = vec2(220.0, 110.0);
    vec2 cellId = floor(vUv * grid);
    vec2 cell = fract(vUv * grid) - 0.5;
    float cellLand = texture2D(uLand, (cellId + 0.5) / grid).r;
    float dotMask = 1.0 - smoothstep(0.16, 0.3, length(cell));
    float landDots = dotMask * step(0.5, cellLand);
    float sweep = 0.5 + 0.5 * sin(vUv.x * 40.0 - uTime * 0.8);

    vec2 g = abs(fract(vUv * vec2(36.0, 18.0)) - 0.5);
    float lines = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));

    vec3 deep = vec3(0.006, 0.02, 0.07);
    vec3 dig = deep + vec3(0.03, 0.12, 0.42) * pow(ndv, 1.5) * 0.35;
    dig += vec3(0.2, 0.5, 1.0) * pow(rim, 2.8) * (0.75 + uGlow * 0.45);
    dig += vec3(0.65, 0.85, 1.0) * pow(rim, 8.0) * 0.7;
    float dotsLevel = 0.18 + 0.75 * sin(3.14159 * clamp(uDigital, 0.0, 1.0));
    dig += vec3(0.3, 0.6, 1.0) * landDots * dotsLevel * (0.6 + 0.4 * sweep) * (0.35 + 0.65 * ndv);
    dig += vec3(0.2, 0.45, 1.0) * lines * 0.05 * ndv;

    float d = smoothstep(0.0, 1.0, uDigital);
    // Mid-morph: the land itself becomes a lattice of dots
    vec3 mid = earth + vec3(0.25, 0.55, 1.0) * landDots * sin(3.14159 * d) * 0.55;
    vec3 col = mix(mid, dig, d);

    gl_FragColor = vec4(col * uReveal, uReveal);
  }
`;

const atmosVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const atmosFragment = /* glsl */ `
  uniform float uIntensity;
  uniform float uLimb;
  uniform float uPower;
  uniform vec3 uGlowDir;
  uniform vec3 uColor;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    // Back faces: 0 at the outer edge of the shell, uLimb at the planet's edge
    float k = clamp(-dot(N, V) / uLimb, 0.0, 1.0);
    float a = pow(k, uPower);
    float dir = mix(0.55, 1.45, smoothstep(-0.6, 0.9, dot(N, uGlowDir)));
    gl_FragColor = vec4(uColor * a * uIntensity * dir, 1.0);
  }
`;

export class Earth {
  readonly group = new THREE.Group();
  readonly globe: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  readonly atmosphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  readonly core: THREE.Sprite;
  private atmosScale = 1.04;

  constructor(segments: number) {
    const geo = new THREE.SphereGeometry(1, segments, Math.round(segments / 2));
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;

    this.globe = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        vertexShader: earthVertex,
        fragmentShader: earthFragment,
        transparent: true,
        uniforms: {
          uLand: { value: blank },
          uLights: { value: blank },
          uReveal: { value: 0 },
          uSurface: { value: 1 },
          uCity: { value: 1 },
          uDigital: { value: 0 },
          uGlow: { value: 0 },
          uTime: { value: 0 },
          uLightDir: { value: new THREE.Vector3(-0.45, -0.6, -0.65).normalize() },
        },
      }),
    );
    this.globe.renderOrder = 1;

    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 48),
      new THREE.ShaderMaterial({
        vertexShader: atmosVertex,
        fragmentShader: atmosFragment,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        ...GLOW_BLENDING,
        uniforms: {
          uIntensity: { value: 0 },
          uLimb: { value: 0.3 },
          uPower: { value: 2.2 },
          uGlowDir: { value: new THREE.Vector3(-0.6, -0.75, 0.1).normalize() },
          uColor: { value: new THREE.Color(0.18, 0.45, 1.0) },
        },
      }),
    );
    this.atmosphere.renderOrder = 0;
    this.setAtmosphereScale(1.04);

    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeCoreTexture(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        ...GLOW_BLENDING,
        opacity: 0,
      }),
    );
    this.core.scale.setScalar(1.25);
    this.core.renderOrder = 5;

    this.group.add(this.atmosphere, this.globe, this.core);
  }

  setTextures(land: THREE.Texture, lights: THREE.Texture) {
    this.globe.material.uniforms.uLand.value = land;
    this.globe.material.uniforms.uLights.value = lights;
  }

  setAtmosphereScale(s: number) {
    if (s === this.atmosScale) return;
    this.atmosScale = s;
    this.atmosphere.scale.setScalar(s);
    // cos of the angle at which the planet's limb sits inside the shell
    this.atmosphere.material.uniforms.uLimb.value = Math.sqrt(1 - 1 / (s * s));
  }

  dispose() {
    this.globe.geometry.dispose();
    this.globe.material.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphere.material.dispose();
    (this.core.material as THREE.SpriteMaterial).map?.dispose();
    this.core.material.dispose();
  }
}

/** Innosoft hex-"S" mark rendered with glow for the sphere core. */
function makeCoreTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const s = size / 32;
  const path = () => {
    ctx.beginPath();
    const pts = [
      [24.5, 9.5],
      [16, 4.6],
      [7.5, 9.5],
      [7.5, 14.2],
      [24.5, 17.8],
      [24.5, 22.5],
      [16, 27.4],
      [7.5, 22.5],
    ];
    ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x * s, y * s);
  };
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";
  const glow = (blur: number, width: number, color: string) => {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    path();
    ctx.stroke();
    ctx.restore();
  };
  // Scale the glyph into the centre ~45% of the sprite
  ctx.translate(size * 0.275, size * 0.275);
  ctx.scale(0.45, 0.45);
  glow(48, 4.2 * s, "rgba(40,110,255,0.9)");
  glow(16, 3.6 * s, "rgba(60,140,255,0.9)");
  glow(0, 3.2 * s, "rgba(70,150,255,1)");
  glow(0, 1.2 * s, "rgba(190,225,255,0.85)");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
