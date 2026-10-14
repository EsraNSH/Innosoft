import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { CITIES, mulberry32 } from "./geo";

type Ring = number[][];

/** Draw a lon/lat ring onto an equirectangular canvas, handling antimeridian wrap. */
function traceRing(ctx: CanvasRenderingContext2D, ring: Ring, w: number, h: number) {
  // Unwrap longitudes so rings crossing ±180 stay continuous
  let prev = ring[0][0];
  let offset = 0;
  const pts: [number, number][] = [];
  for (const [lon, lat] of ring) {
    const d = lon - prev;
    if (d > 180) offset -= 360;
    else if (d < -180) offset += 360;
    prev = lon;
    pts.push([((lon + offset + 180) / 360) * w, ((90 - lat) / 180) * h]);
  }
  for (const shift of [-w, 0, w]) {
    ctx.moveTo(pts[0][0] + shift, pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + shift, pts[i][1]);
    ctx.closePath();
  }
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export type EarthTextures = { land: THREE.Texture; lights: THREE.Texture };

/**
 * Builds the land mask and night-lights textures procedurally from
 * Natural Earth land polygons (world-atlas, public domain).
 */
export async function buildEarthTextures(opts: { lightsWidth: number }): Promise<EarthTextures> {
  const res = await fetch("/data/land-50m.json");
  const topo = (await res.json()) as Topology<{ land: GeometryCollection }>;
  const land = feature(topo, topo.objects.land);

  // --- Land mask -----------------------------------------------------------
  const LW = 2048;
  const LH = 1024;
  const landCanvas = makeCanvas(LW, LH);
  const lctx = landCanvas.getContext("2d")!;
  lctx.fillStyle = "#000";
  lctx.fillRect(0, 0, LW, LH);
  lctx.fillStyle = "#fff";
  lctx.beginPath();
  const features = "features" in land ? land.features : [land];
  for (const f of features) {
    const g = f.geometry;
    if (g.type === "Polygon") for (const r of g.coordinates) traceRing(lctx, r, LW, LH);
    else if (g.type === "MultiPolygon")
      for (const p of g.coordinates) for (const r of p) traceRing(lctx, r, LW, LH);
  }
  lctx.fill("evenodd");

  // Small lookup copy for "is this on land?" checks
  const lookupW = 1024;
  const lookupH = 512;
  const lookup = makeCanvas(lookupW, lookupH);
  const lk = lookup.getContext("2d", { willReadFrequently: true })!;
  lk.drawImage(landCanvas, 0, 0, lookupW, lookupH);
  const landData = lk.getImageData(0, 0, lookupW, lookupH).data;
  const isLand = (lat: number, lon: number) => {
    const x = Math.floor(((((lon + 180) % 360) + 360) % 360) / 360 * lookupW);
    const y = Math.min(lookupH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * lookupH)));
    return landData[(y * lookupW + x) * 4] > 127;
  };

  // --- Night lights --------------------------------------------------------
  const W = opts.lightsWidth;
  const H = W / 2;
  const lights = makeCanvas(W, H);
  const ctx = lights.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const rand = mulberry32(7);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const px = W / 360;

  const dot = (lat: number, lon: number, size: number, alpha: number) => {
    const x = ((lon + 180) / 360) * W;
    const y = ((90 - lat) / 180) * H;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  };

  ctx.fillStyle = "#fff";

  // Scattered rural lights over populated latitudes
  const rural = Math.round(W * 7);
  for (let i = 0; i < rural; i++) {
    const lat = -40 + rand() * 105;
    const lon = -180 + rand() * 360;
    if (!isLand(lat, lon)) continue;
    // Thin out deserts, tundra and rainforest bands roughly
    const band = Math.abs(lat - 30) < 8 && lon > -15 && lon < 60 ? 0.25 : 1;
    const north = lat > 58 ? 0.2 : 1;
    if (rand() > 0.5 * band * north) continue;
    dot(lat, lon, px * (0.06 + rand() * 0.06), 0.1 + rand() * 0.3);
  }

  // City clusters
  for (const c of CITIES) {
    const n = Math.round(420 * c.w);
    const spread = 0.35 + c.w * 1.1; // degrees
    for (let i = 0; i < n; i++) {
      const r = Math.abs(gauss());
      const lat = c.lat + gauss() * spread * 0.55;
      const lon = c.lon + (gauss() * spread * 0.55) / Math.cos((c.lat * Math.PI) / 180);
      if (!isLand(lat, lon) && r > 0.6) continue;
      const a = Math.max(0.06, 1 - r * 0.5) * (0.3 + rand() * 0.6);
      dot(lat, lon, px * (0.05 + rand() * 0.07), a);
    }
    // Bright core
    const x = ((c.lon + 180) / 360) * W;
    const y = ((90 - c.lat) / 180) * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, px * (0.18 + c.w * 0.32));
    g.addColorStop(0, `rgba(255,255,255,${0.35 + c.w * 0.35})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(x - px * 2, y - px * 2, px * 4, px * 4);
    ctx.fillStyle = "#fff";
  }

  // Soft bloom pass baked into the texture
  const bloom = makeCanvas(W, H);
  const bctx = bloom.getContext("2d")!;
  bctx.filter = `blur(${Math.max(1.5, W / 1600)}px)`;
  bctx.drawImage(lights, 0, 0);
  ctx.globalAlpha = 0.55;
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(bloom, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const landTex = new THREE.CanvasTexture(landCanvas);
  landTex.colorSpace = THREE.NoColorSpace;
  landTex.anisotropy = 4;
  const lightsTex = new THREE.CanvasTexture(lights);
  lightsTex.colorSpace = THREE.NoColorSpace;
  lightsTex.anisotropy = 8;
  return { land: landTex, lights: lightsTex };
}
