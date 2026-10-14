"use client";

import { useState } from "react";
import shared from "./about.module.css";
import styles from "./OurApproach.module.css";

const CAPABILITIES = [
  {
    title: "Software",
    description: "Digital solutions designed around organizational needs.",
    // Diagram position in the 400×340 viewBox
    x: 200,
    y: 56,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="15" rx="2" />
        <path d="M3 8.5h18M9.5 12.5 7.5 14.5l2 2M14.5 12.5l2 2-2 2" />
      </svg>
    ),
  },
  {
    title: "Infrastructure",
    description: "Reliable foundations that support secure and scalable operations.",
    x: 66,
    y: 284,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
        <rect x="3.5" y="14" width="17" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01M12 10v4" />
      </svg>
    ),
  },
  {
    title: "Technology Consulting",
    description: "Technical expertise to help organizations navigate complexity and make informed decisions.",
    x: 334,
    y: 284,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </svg>
    ),
  },
];

const LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
];

export default function OurApproach() {
  const [active, setActive] = useState<number | null>(null);
  const bind = (i: number) => ({
    onPointerEnter: () => setActive(i),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
  });

  return (
    <section
      id="approach"
      className={`${shared.section} ${styles.section}`}
      aria-labelledby="approach-title"
      data-chapter-section="1"
      data-active={active ?? undefined}
    >
      <div className={styles.grid}>
        <div>
          <p className={shared.eyebrow} data-reveal>
            Our Approach
          </p>
          <h2 id="approach-title" className={shared.h2} data-reveal>
            <span>Technology That</span>
            <span className={shared.accent}>Works Together.</span>
          </h2>
          <p className={shared.lead} data-reveal>
            We bring software, infrastructure, and technology consulting together to address complex organizational
            needs.
          </p>
          <ol className={styles.list}>
            {CAPABILITIES.map((c, i) => (
              <li key={c.title} className={styles.item} data-index={i} data-reveal {...bind(i)}>
                <span className={styles.num}>0{i + 1}</span>
                <div>
                  <h3 className={styles.itemTitle}>{c.title}</h3>
                  <p id={`capability-${i}`} className={styles.itemDesc}>
                    {c.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.diagram} data-draw>
          <svg className={styles.svg} viewBox="0 0 400 340" aria-hidden="true">
            <circle className={styles.halo} cx="200" cy="208" r="158" />
            {LINKS.map(([a, b]) => (
              <line
                key={`l${a}${b}`}
                className={styles.line}
                x1={CAPABILITIES[a].x}
                y1={CAPABILITIES[a].y}
                x2={CAPABILITIES[b].x}
                y2={CAPABILITIES[b].y}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1"
                data-touch={`${a} ${b}`}
                data-draw-line
              />
            ))}
            {LINKS.map(([a, b], i) => (
              <line
                key={`f${a}${b}`}
                className={styles.flow}
                style={{ animationDelay: `${-i * 1.5}s` }}
                x1={CAPABILITIES[a].x}
                y1={CAPABILITIES[a].y}
                x2={CAPABILITIES[b].x}
                y2={CAPABILITIES[b].y}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
              />
            ))}
          </svg>
          {CAPABILITIES.map((c, i) => (
            <button
              key={c.title}
              type="button"
              className={styles.node}
              style={{ left: `${(c.x / 400) * 100}%`, top: `${(c.y / 340) * 100}%` }}
              data-index={i}
              aria-describedby={`capability-${i}`}
              data-draw-node
              {...bind(i)}
            >
              <span className={styles.nodeRing}>{c.icon}</span>
              <span className={styles.nodeLabel}>{c.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
