import * as THREE from "three";
import { Backdrop } from "./Backdrop";
import { Earth } from "./Earth";
import { Network } from "./Network";
import { Particles } from "./Particles";
import { buildEarthTextures } from "./earthTextures";
import { cityByName, latLonToVec3 } from "./geo";
import { heroPlacement, type SceneState } from "./sceneState";

const FOV = 22;
const CAM_Z = 40;
const TAN_HALF = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

type Options = { mobile: boolean; reduced: boolean };

/**
 * Owns the single WebGL scene shared by every chapter.
 * It never animates anything itself — it renders whatever SceneState says,
 * plus a small amount of time-based ambient motion.
 */
export class World {
  readonly ready: Promise<void>;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
  private system = new THREE.Group();
  private earth: Earth;
  private network: Network;
  private particles: Particles;
  private backdrop = new Backdrop();
  private screen = new THREE.Vector3();
  private qHero = new THREE.Quaternion();
  private qApproach = new THREE.Quaternion();
  private qSpin = new THREE.Quaternion();
  private qEarth = new THREE.Quaternion();
  private labels: HTMLElement[] = [];
  private tmp = new THREE.Vector3();
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private disposed = false;
  private start = performance.now();

  constructor(
    private canvas: HTMLCanvasElement,
    private state: SceneState,
    private opts: Options,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x05070d, 1);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75);
    this.renderer.setPixelRatio(this.pixelRatio);

    this.camera.position.set(0, 0, CAM_Z);

    this.earth = new Earth(opts.mobile ? 128 : 192);
    this.network = new Network({ ringCount: opts.mobile ? 2 : 3, pixelRatio: this.pixelRatio });
    this.particles = new Particles({ mobile: opts.mobile, pixelRatio: this.pixelRatio, reduced: opts.reduced });

    this.system.add(this.earth.group, this.network.group);
    this.scene.add(this.backdrop.mesh, this.particles.stars, this.particles.dust, this.system);

    this.resize();

    this.ready = buildEarthTextures({ lightsWidth: opts.mobile ? 2048 : 4096 })
      .then(({ land, lights }) => {
        if (this.disposed) {
          land.dispose();
          lights.dispose();
          return;
        }
        this.earth.setTextures(land, lights);
        this.renderer.compile(this.scene, this.camera);
      })
      .catch((err) => {
        console.warn("[World] earth textures failed, continuing without them", err);
      });
  }

  /** DOM labels anchored to orbit points (DISCOVER / DESIGN / BUILD). */
  setLabels(elements: HTMLElement[]) {
    this.labels = elements;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.backdrop.setResolution(this.width * this.pixelRatio, this.height * this.pixelRatio);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.computeOrientations();
  }

  /** Viewport half extents at z = 0 for the un-pushed camera. */
  private extents() {
    const halfH = TAN_HALF * CAM_Z;
    return { halfW: halfH * (this.width / this.height), halfH };
  }

  private worldRadius(fraction: number) {
    return CAM_Z * Math.sin(Math.atan(2 * fraction * TAN_HALF));
  }

  /**
   * Orient the globe so Riyadh sits in the visible part of the hero horizon
   * with north roughly up; and facing the viewer in the approach sphere.
   */
  private computeOrientations() {
    const riyadh = cityByName("Riyadh");
    const local = latLonToVec3(riyadh.lat, riyadh.lon);

    const { halfW, halfH } = this.extents();
    const hp = heroPlacement();
    const center = new THREE.Vector3(hp.x * halfW, hp.y * halfH, 0);
    const R = this.worldRadius(hp.radius);
    const mobile = this.width < 768;
    // Screen point (viewport half extents) where Riyadh should sit in the hero
    const target = mobile ? { x: 0.2, y: -0.72 } : { x: 0.5, y: 0.32 };
    // Ray from the camera through the target screen point
    const origin = new THREE.Vector3(0, 0, CAM_Z);
    const dir = new THREE.Vector3(target.x * halfW, target.y * halfH, 0).sub(origin).normalize();
    const oc = origin.clone().sub(center);
    const b = oc.dot(dir);
    const c = oc.lengthSq() - R * R;
    const disc = b * b - c;
    let normal: THREE.Vector3;
    if (disc > 0) {
      const t = -b - Math.sqrt(disc);
      normal = origin.clone().addScaledVector(dir, t).sub(center).normalize();
    } else {
      normal = new THREE.Vector3(-0.5, -0.6, 0.6).normalize();
    }
    this.qHero.copy(frameRotation(local, normal));
    this.qApproach.copy(frameRotation(local, new THREE.Vector3(0.18, 0.32, 1).normalize()));
  }

  tick = () => {
    if (this.disposed) return;
    const s = this.state;
    const time = (performance.now() - this.start) / 1000;
    const ambient = this.opts.reduced ? 0 : 1;
    const { halfW, halfH } = this.extents();

    // Camera: gentle dolly + drift
    this.camera.position.z = CAM_Z - s.cameraPush * 3.2;
    this.camera.position.x = Math.sin(time * 0.05) * 0.25 * ambient;
    this.camera.position.y = Math.cos(time * 0.04) * 0.15 * ambient;
    this.camera.lookAt(0, 0, 0);

    // System placement
    const lift = (1 - s.introEarth) * 0.07;
    this.system.position.set(s.x * halfW, (s.y + s.exitY - lift) * halfH, 0);
    const R = this.worldRadius(s.radius);
    this.system.scale.setScalar(R);

    // Globe orientation: hero → approach, plus a slow spin
    const t = s.tilt * s.tilt * (3 - 2 * s.tilt);
    this.qEarth.slerpQuaternions(this.qHero, this.qApproach, t);
    this.qSpin.setFromAxisAngle(Y_AXIS, -0.12 + time * 0.0045 * ambient);
    this.qEarth.multiply(this.qSpin);
    this.earth.globe.quaternion.copy(this.qEarth);

    // Earth / sphere uniforms
    const u = this.earth.globe.material.uniforms;
    u.uReveal.value = s.introEarth;
    u.uSurface.value = s.surface;
    u.uCity.value = s.cityLights * (0.92 + 0.08 * Math.sin(time * 0.7) * ambient);
    u.uDigital.value = s.digital;
    u.uGlow.value = s.coreGlow;
    u.uTime.value = time;

    // Atmosphere: thin crisp limb on the planet → soft halo around the sphere
    this.earth.setAtmosphereScale(1.035 + s.digital * 0.2);
    const au = this.earth.atmosphere.material.uniforms;
    const pulse = 1 + Math.sin(time * 0.45) * 0.04 * ambient;
    au.uIntensity.value = s.introAtmosphere * s.atmosphere * pulse * (1 + s.coreGlow * 0.3) * (1.6 - s.digital * 1.0);
    au.uPower.value = 2.6 + s.digital * 1.4;

    const coreMat = this.earth.core.material as THREE.SpriteMaterial;
    coreMat.opacity = s.coreMark * (0.88 + 0.12 * Math.sin(time * 1.1) * ambient);
    this.earth.core.position.set(0, 0, 1.05);

    this.network.update(s, time, this.qEarth, R, ambient);
    this.particles.update(time, s.introStars, 0.15 + s.orbitDraw * 0.55);

    // Backdrop light follows the object across the transition
    this.screen.copy(this.system.position).project(this.camera);
    this.backdrop.update(
      Math.min(1.2, Math.max(-0.2, this.screen.x * 0.5 + 0.5)),
      Math.min(1.2, Math.max(-0.2, this.screen.y * 0.5 + 0.5)),
      (0.6 + 0.4 * s.introEarth) * (1 + s.coreGlow * 0.4),
    );

    this.renderer.render(this.scene, this.camera);
    this.positionLabels();
  };

  private positionLabels() {
    if (!this.labels.length) return;
    this.system.updateMatrixWorld();
    this.labels.forEach((el, i) => {
      const a = this.network.labelAnchors[i];
      if (!a) return;
      this.network.ringPoint(a.ring, a.angle, this.tmp);
      this.system.localToWorld(this.tmp);
      this.tmp.project(this.camera);
      const x = (this.tmp.x * 0.5 + 0.5) * this.width;
      const y = (-this.tmp.y * 0.5 + 0.5) * this.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      // Keep copy on-screen: text sits left of the icon near the right edge
      const flip = x > this.width - 250;
      if (flip !== el.hasAttribute("data-flip")) el.toggleAttribute("data-flip", flip);
    });
  }

  dispose() {
    this.disposed = true;
    this.earth.dispose();
    this.network.dispose();
    this.particles.dispose();
    this.backdrop.dispose();
    this.renderer.dispose();
  }
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const UP = new THREE.Vector3(0, 1, 0);

/** Rotation taking the local tangent frame at `from` to the frame at `to`, keeping north up. */
function frameRotation(from: THREE.Vector3, to: THREE.Vector3) {
  const basis = (n: THREE.Vector3) => {
    const east = new THREE.Vector3().crossVectors(UP, n).normalize();
    const north = new THREE.Vector3().crossVectors(n, east).normalize();
    return new THREE.Matrix4().makeBasis(east, north, n.clone().normalize());
  };
  const a = basis(from);
  const b = basis(to);
  const m = b.multiply(a.transpose());
  return new THREE.Quaternion().setFromRotationMatrix(m);
}
