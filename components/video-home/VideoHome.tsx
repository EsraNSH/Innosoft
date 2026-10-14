"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChapterNavigation, { HOME_CHAPTERS } from "@/components/ChapterNavigation";
import HeroSection from "@/components/HeroSection";
import ApproachSection from "@/components/ApproachSection";
import OrbitalLabel from "@/components/OrbitalLabel";
import { createAboutChapters } from "@/animations/about/chapters";
import { scrollToY } from "@/lib/smoothScroll";
import { prefersReducedMotion } from "@/lib/motion";
import VideoBackground from "./VideoBackground";
import ScrubVideoBackground from "./ScrubVideoBackground";
import styles from "./VideoHome.module.css";

const PILLARS = [
  { kind: "discover", title: "DISCOVER", description: "We create human-centered digital experiences." },
  { kind: "design", title: "DESIGN", description: "We create thoughtful user experiences." },
  { kind: "build", title: "BUILD", description: "We engineer secure and scalable systems." },
] as const;

type Props = {
  /**
   * "loop": video plays continuously behind the content (/home-video).
   * "scrub": scroll position drives the video timeline (/home-scrub); chapters get
   * extra scroll length with their content held in place, so the footage has room to play.
   */
  mode?: "loop" | "scrub";
};

/** Homepage, video versions: the same Hero and Our Approach content over one continuous background video. */
export default function VideoHome({ mode = "loop" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const scrub = mode === "scrub";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // Hero copy: a short, quiet entrance
      gsap.fromTo(
        "[data-hero-eyebrow], [data-hero-line], [data-hero-desc], [data-hero-cta], [data-trusted]",
        { autoAlpha: 0, y: reduced ? 0 : 18 },
        { autoAlpha: 1, y: 0, duration: reduced ? 0.4 : 1.1, stagger: reduced ? 0 : 0.08, delay: 0.3, ease: "power3.out" },
      );
      // Section 02 copy and pillars: hidden by global CSS until revealed on entry
      gsap.fromTo(
        "[data-approach-eyebrow], [data-approach-line], [data-approach-desc], [data-approach-cta], [data-label]",
        { autoAlpha: 0, x: reduced ? 0 : -24 },
        {
          autoAlpha: 1,
          x: 0,
          duration: reduced ? 0.4 : 1,
          stagger: reduced ? 0 : 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: "#approach", start: "top 65%", once: true },
        },
      );
      createAboutChapters();
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const navigate = useCallback((index: number) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-chapter-section="${index}"]`);
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY, 1.6);
  }, []);

  return (
    <div ref={rootRef}>
      {scrub ? <ScrubVideoBackground rangeRef={mainRef} /> : <VideoBackground />}
      <Header />
      <ChapterNavigation chapters={HOME_CHAPTERS} onNavigate={navigate} withProgress={false} />
      <main ref={mainRef} className={`${styles.main} ${scrub ? styles.scrub : ""}`}>
        <div className={styles.chapter} data-chapter-section="0">
          <div className={styles.hold}>
            <HeroSection />
          </div>
        </div>
        <div className={styles.chapter} data-chapter-section="1">
          <div className={styles.hold}>
            <ApproachSection />
            <div className={styles.pillars} aria-label="Our approach pillars">
              {PILLARS.map((p) => (
                <OrbitalLabel key={p.kind} kind={p.kind} title={p.title} description={p.description} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <div className={styles.footerWrap}>
        <Footer />
      </div>
    </div>
  );
}
