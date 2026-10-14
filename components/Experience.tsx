"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./Header";
import ChapterNavigation from "./ChapterNavigation";
import HeroSection from "./HeroSection";
import ApproachSection from "./ApproachSection";
import OrbitalLabel from "./OrbitalLabel";
import { World } from "@/scene/World";
import { createSceneState } from "@/scene/sceneState";
import { playHeroIntro } from "@/animations/heroAnimation";
import { APPROACH_SETTLED, createStageExit, createTransition } from "@/animations/transitionAnimation";
import { bindLabelHover } from "@/animations/approachAnimation";
import { createChapterNavigation } from "@/animations/chapterNavigation";
import { scrollToY } from "@/lib/smoothScroll";
import { isMobileViewport, prefersReducedMotion } from "@/lib/motion";
import styles from "./Experience.module.css";

const LABELS = [
  { kind: "discover", title: "DISCOVER", description: "We create human-centered digital experiences." },
  { kind: "design", title: "DESIGN", description: "We create thoughtful user experiences." },
  { kind: "build", title: "BUILD", description: "We engineer secure and scalable systems." },
] as const;

export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = prefersReducedMotion();
    const mobile = isMobileViewport();
    const state = createSceneState();
    const world = new World(canvasRef.current!, state, { mobile, reduced });
    const labels = labelRefs.current.filter(Boolean) as HTMLDivElement[];
    world.setLabels(labels);
    gsap.ticker.add(world.tick);

    const unbindHover = bindLabelHover(state, labels);

    const ctx = gsap.context(() => {
      createTransition(state, { reduced });
      createChapterNavigation(APPROACH_SETTLED);
      createStageExit(state);
    }, rootRef);

    let cancelled = false;
    world.ready.then(() => {
      if (cancelled) return;
      ctx.add(() => playHeroIntro(state, { reduced }));
    });

    const onResize = () => world.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(world.tick);
      unbindHover();
      ctx.revert();
      world.dispose();
    };
  }, []);

  const navigate = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    if (index === 0) return scrollToY(0);
    const scrollable = track.offsetHeight - window.innerHeight;
    scrollToY(track.offsetTop + scrollable * APPROACH_SETTLED, 2.4);
  }, []);

  return (
    <div ref={rootRef} className="intro-pending">
      <canvas ref={canvasRef} className={styles.scene} aria-hidden="true" />
      <Header />
      <ChapterNavigation onNavigate={navigate} />

      <main className={styles.main}>
        <div ref={trackRef} className={styles.track} data-stage-track>
          <div className={styles.stage}>
            <HeroSection />
            <ApproachSection />
          </div>
        </div>
        <section className={styles.next} data-after-stage aria-label="Coming next">
          03 — SOLUTIONS · PHASE 2
        </section>
      </main>

      <div className={styles.labels} aria-label="Our approach pillars">
        {LABELS.map((l, i) => (
          <OrbitalLabel
            key={l.kind}
            kind={l.kind}
            title={l.title}
            description={l.description}
            anchorRef={(el) => {
              labelRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
