import { mulberry32 } from "@/lib/random";

export type NetNode = { x: number; y: number; r: number; kind: "glow" | "dot" | "square"; tier: 1 | 2; twinkle: number };
export type NetLine = { x1: number; y1: number; x2: number; y2: number; o: number; tier: 1 | 2; drop?: boolean };
export type Graph = { nodes: NetNode[]; lines: NetLine[]; width: number; height: number };

export type FieldVariant = "hero" | "horizon";

const W = 1600;
const H = 900;

/**
 * Deterministic abstract network (same on server and client → no hydration drift).
 * "hero" clusters on the right with a diagonal band; "horizon" settles toward the bottom.
 */
export function buildGraph(variant: FieldVariant): Graph {
  const rand = mulberry32(variant === "hero" ? 2011 : 77);
  const count = variant === "hero" ? 66 : 54;
  const nodes: NetNode[] = [];

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    if (variant === "hero") {
      // Right-weighted, loosely following a bottom-left → top-right band
      const t = rand();
      x = W * (0.36 + 0.64 * Math.pow(rand(), 0.75));
      const band = H * (0.95 - (x / W) * 0.75);
      y = Math.min(H - 20, Math.max(40, band + (t - 0.5) * H * 0.75));
    } else {
      x = W * (0.02 + 0.96 * rand());
      y = H * (0.42 + 0.56 * Math.pow(rand(), 0.6));
    }
    const k = rand();
    const kind: NetNode["kind"] = k > 0.82 ? "glow" : k > 0.7 ? "square" : "dot";
    nodes.push({
      x,
      y,
      r: kind === "glow" ? 2.6 + rand() * 1.6 : kind === "square" ? 3 : 1 + rand() * 1.2,
      kind,
      tier: i < count * 0.55 ? 1 : 2,
      twinkle: rand(),
    });
  }

  // Connect each node to its nearest neighbours within reach
  const lines: NetLine[] = [];
  const seen = new Set<string>();
  const reach = variant === "hero" ? 290 : 260;
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((n) => n.j !== i && n.d < reach)
      .sort((p, q) => p.d - q.d)
      .slice(0, a.kind === "glow" ? 3 : 1);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const b = nodes[j];
      lines.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        o: a.kind === "glow" || b.kind === "glow" ? 0.5 : 0.22,
        tier: a.tier === 1 && b.tier === 1 ? 1 : 2,
      });
    }
  });

  // Vertical "drop" lines ending in small squares (a detail from the reference)
  nodes
    .filter((n) => n.kind === "glow")
    .slice(0, 6)
    .forEach((n) => {
      const len = 70 + rand() * 170;
      const y2 = Math.min(H - 10, n.y + len);
      lines.push({ x1: n.x, y1: n.y, x2: n.x, y2, o: 0.35, tier: n.tier, drop: true });
      nodes.push({ x: n.x, y: y2, r: 3, kind: "square", tier: n.tier, twinkle: rand() });
    });

  return { nodes, lines, width: W, height: H };
}
