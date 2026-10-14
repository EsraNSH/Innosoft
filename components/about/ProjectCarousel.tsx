"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import SiteLink from "@/components/SiteLink";
import type { Project } from "@/data/projects";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "./Icons";
import styles from "./ProjectCarousel.module.css";

type Props = { projects: Project[]; initial?: number; label: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Depth carousel: centre card in focus, neighbours partially visible.
 * Slot positions are pure CSS (data-slot) so transitions stay on the compositor.
 * No autoplay, no wrap-around — the user is always in control.
 */
export default function ProjectCarousel({ projects, initial = 1, label }: Props) {
  const total = projects.length;
  const [active, setActive] = useState(Math.min(initial, total - 1));
  const go = useCallback((i: number) => setActive(Math.max(0, Math.min(total - 1, i))), [total]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    }
  };

  // Touch swipe
  const start = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {projects.map((p, i) => {
          const slot = Math.max(-2, Math.min(2, i - active));
          const isActive = slot === 0;
          const isSide = Math.abs(slot) === 1;
          return (
            <article
              key={p.id}
              className={styles.card}
              data-slot={slot}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}: ${p.title}`}
              aria-hidden={!isActive && !isSide ? true : undefined}
            >
              <div inert={!isActive}>
                <div className={styles.media}>
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes="(max-width: 767px) 84vw, (max-width: 1023px) 58vw, 540px"
                    loading="lazy"
                    unoptimized={p.image.src.endsWith(".svg")}
                  />
                  <span className={styles.index} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  {p.isPlaceholder && <span className={styles.placeholderTag}>Illustrative placeholder</span>}
                </div>
                <div className={styles.body}>
                  <p className={styles.category}>{p.category}</p>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{p.title}</h3>
                    <SiteLink
                      href={p.href}
                      className={styles.explore}
                      pendingLabel="Case study coming soon"
                    >
                      <ArrowUpRight size={14} />
                      <span className="sr-only">Explore project: {p.title}</span>
                    </SiteLink>
                  </div>
                  <p className={styles.desc}>{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <ul className={styles.tags} aria-label="Tags">
                      {p.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {isSide && (
                <button
                  type="button"
                  className={styles.cardHit}
                  onClick={() => go(i)}
                  aria-label={`Show project ${i + 1}: ${p.title}`}
                />
              )}
            </article>
          );
        })}

        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={() => go(active - 1)}
          // aria-disabled (not disabled) keeps keyboard focus on the control at the ends
          aria-disabled={active === 0}
          aria-label="Previous project"
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={() => go(active + 1)}
          aria-disabled={active === total - 1}
          aria-label="Next project"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className={styles.pager}>
        <span className={styles.pagerRule} aria-hidden="true" />
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={styles.pageBtn}
            aria-current={i === active ? "true" : undefined}
            aria-label={`Project ${i + 1}: ${p.title}`}
            onClick={() => go(i)}
          >
            {pad(i + 1)}
          </button>
        ))}
        <span className={styles.pagerRule} aria-hidden="true" />
      </div>
      <p className={styles.counter} aria-live="polite">
        {pad(active + 1)} / {pad(total)}
        <span className="sr-only">: {projects[active].title}</span>
      </p>
    </div>
  );
}
