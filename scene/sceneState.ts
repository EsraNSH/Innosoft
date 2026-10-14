/**
 * Single source of truth for the WebGL scene.
 * GSAP tweens these plain numbers; the render loop only reads them.
 *
 * Position units: x / y are in viewport half-extents at z = 0
 * (x = 1 is the right edge, y = 1 is the top edge).
 * `radius` is the sphere radius as a fraction of the viewport height.
 */
export type SceneState = {
  // Intro (time-based entrance) multipliers
  introStars: number;
  introEarth: number;
  introAtmosphere: number;
  introNodes: number;

  // System placement
  x: number;
  y: number;
  radius: number;
  cameraPush: number; // 0..1 subtle dolly toward the scene
  tilt: number; // 0 = hero orientation, 1 = approach orientation

  // Earth → digital sphere
  surface: number; // dark land/ocean visibility
  cityLights: number;
  digital: number; // 0 = earth shader, 1 = glassy digital sphere
  atmosphere: number;
  coreGlow: number;
  coreMark: number;

  // Network → orbits
  network: number; // arc + node visibility
  morph: number; // 0 = arcs on the globe, 1 = arcs lifted onto orbits
  orbitDraw: number; // full orbital rings drawing in
  labels: number; // label anchor nodes

  // Exit offset (scroll past the stage), in viewport half-extents
  exitY: number;

  // Hover pulse per label (DISCOVER, DESIGN, BUILD)
  hover: [number, number, number];
};

export function createSceneState(): SceneState {
  return {
    introStars: 0,
    introEarth: 0,
    introAtmosphere: 0,
    introNodes: 0,

    x: 0,
    y: 0,
    radius: 1,
    cameraPush: 0,
    tilt: 0,

    surface: 1,
    cityLights: 1,
    digital: 0,
    atmosphere: 1,
    coreGlow: 0,
    coreMark: 0,

    network: 0.8,
    morph: 0,
    orbitDraw: 0,
    labels: 0,

    exitY: 0,
    hover: [0, 0, 0],
  };
}

/** Layout targets per breakpoint. Functions so they re-evaluate on resize. */
export type Placement = { x: number; y: number; radius: number };

/**
 * Fit a circle through three screen points (fractions of width/height, y down)
 * so the planet's limb sweeps through the same place at any aspect ratio.
 */
function limbThrough(a: [number, number], b: [number, number], c: [number, number]): Placement {
  const aspect = window.innerWidth / window.innerHeight;
  // Into half-height units, y up
  const P = [a, b, c].map(([fx, fy]) => [(fx * 2 - 1) * aspect, 1 - fy * 2]);
  const [[x1, y1], [x2, y2], [x3, y3]] = P;
  const d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
  const s1 = x1 * x1 + y1 * y1;
  const s2 = x2 * x2 + y2 * y2;
  const s3 = x3 * x3 + y3 * y3;
  const ux = (s1 * (y2 - y3) + s2 * (y3 - y1) + s3 * (y1 - y2)) / d;
  const uy = (s1 * (x3 - x2) + s2 * (x1 - x3) + s3 * (x2 - x1)) / d;
  const r = Math.hypot(x1 - ux, y1 - uy);
  return { x: ux / aspect, y: uy, radius: r / 2 };
}

export function heroPlacement(): Placement {
  if (window.innerWidth < 768) {
    // Portrait: a wide horizon arcing across the lower third
    return limbThrough([-0.08, 0.92], [0.55, 0.7], [1.08, 0.76]);
  }
  // Desktop: planet crowns the top-right, limb sweeping from the top down to the right edge
  return limbThrough([0.44, -0.02], [0.6, 0.5], [1.02, 0.84]);
}

export function approachPlacement(): Placement {
  const w = window.innerWidth;
  if (w < 768) {
    return { x: 0.04, y: -0.42, radius: 0.07 };
  }
  return { x: 0.3, y: -0.02, radius: 0.125 };
}
