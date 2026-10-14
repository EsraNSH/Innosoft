import * as THREE from "three";

const vertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec2 uResolution;
  uniform vec2 uGlowPos;
  uniform float uGlow;
  varying vec2 vUv;
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / uResolution.y;
    vec3 col = vec3(0.0196, 0.0275, 0.051); // #05070D

    // Deep-space light that follows the planet / sphere
    vec2 d = (uv - uGlowPos) * vec2(aspect, 1.0);
    col += vec3(0.012, 0.03, 0.08) * exp(-dot(d, d) * 2.4) * uGlow;
    // Cool fill from the lower left
    vec2 d2 = (uv - vec2(0.05, -0.1)) * vec2(aspect, 1.0);
    col += vec3(0.006, 0.012, 0.03) * exp(-dot(d2, d2) * 2.2);
    // Subtle vignette
    float v = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(aspect * 0.8, 1.0)));
    col *= mix(0.7, 1.0, v);
    // Dither to avoid banding in the dark gradients
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class Backdrop {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uGlowPos: { value: new THREE.Vector2(0.85, 0.9) },
          uGlow: { value: 1 },
        },
      }),
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -100;
  }

  setResolution(w: number, h: number) {
    this.mesh.material.uniforms.uResolution.value.set(w, h);
  }

  /** Screen position (0..1, y up) of the glow; follows the main object. */
  update(x: number, y: number, intensity: number) {
    const u = this.mesh.material.uniforms;
    u.uGlowPos.value.set(x, y);
    u.uGlow.value = intensity;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
