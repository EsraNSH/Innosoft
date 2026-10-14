"use client";

import { useEffect, useMemo, useRef } from "react";
import { mulberry32 } from "@/lib/random";
import { buildGraph, type FieldVariant } from "./networkGraph";
import styles from "./NetworkField.module.css";

type Props = { variant: FieldVariant; className?: string };

/**
 * Abstract digital-universe background: one static canvas of stars
 * + one SVG network (lines draw in, nodes reveal; see animations/about/networkField.ts).
 * No render loop — ambient motion is a slow CSS drift.
 */
export default function NetworkField({ variant, className }: Props) {
  const graph = useMemo(() => buildGraph(variant), [variant]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const rand = mulberry32(variant === "hero" ? 5 : 9);
      const count = Math.round((width * height) / (width < 768 ? 4200 : 3000));
      for (let i = 0; i < count; i++) {
        const x = rand() * width;
        const y = rand() * height;
        const r = 0.3 + Math.pow(rand(), 3) * 1.1;
        ctx.globalAlpha = 0.15 + rand() * 0.6;
        ctx.fillStyle = rand() > 0.7 ? "#9ec2ff" : "#dfe8ff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [variant]);

  return (
    <div className={`${styles.field} ${styles[variant]} ${className ?? ""}`} aria-hidden="true" data-field>
      <canvas ref={canvasRef} className={styles.stars} data-field-stars />
      {variant === "horizon" && <div className={styles.horizonLine} data-field-horizon />}
      <svg
        className={styles.svg}
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        preserveAspectRatio={variant === "hero" ? "xMaxYMid slice" : "xMidYMax slice"}
        data-field-svg
      >
        <defs>
          <radialGradient id={`glow-${variant}`}>
            <stop offset="0" stopColor="#cfe2ff" />
            <stop offset="0.25" stopColor="#4c8dff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1f66ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className={styles.drift}>
          {graph.lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={l.drop ? "#4c8dff" : "#3d82ff"}
              strokeOpacity={l.o}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              data-net-line
              data-tier={l.tier}
            />
          ))}
          {graph.nodes.map((n, i) =>
            n.kind === "glow" ? (
              <g key={i} data-net-node data-tier={n.tier}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 5}
                  fill={`url(#glow-${variant})`}
                  className={styles.twinkle}
                  style={{ animationDelay: `${(n.twinkle * -5).toFixed(2)}s` }}
                />
                <circle cx={n.x} cy={n.y} r={n.r * 0.7} fill="#eef5ff" />
              </g>
            ) : n.kind === "square" ? (
              <rect
                key={i}
                x={n.x - n.r}
                y={n.y - n.r}
                width={n.r * 2}
                height={n.r * 2}
                fill="#5b98ff"
                fillOpacity={0.85}
                data-net-node
                data-tier={n.tier}
              />
            ) : (
              <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="#7fb0ff" fillOpacity={0.75} data-net-node data-tier={n.tier} />
            ),
          )}
        </g>
      </svg>
    </div>
  );
}
