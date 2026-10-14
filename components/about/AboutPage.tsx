"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChapterNavigation, { type Chapter } from "@/components/ChapterNavigation";
import { createReveals } from "@/animations/about/reveal";
import { createLineDraws } from "@/animations/about/lineDraw";
import { parallaxField, revealNetworkField } from "@/animations/about/networkField";
import { createAboutChapters } from "@/animations/about/chapters";
import { scrollToY } from "@/lib/smoothScroll";
import { isMobileViewport, prefersReducedMotion } from "@/lib/motion";
import AboutHero from "./AboutHero";
import OurStory from "./OurStory";
import OurApproach from "./OurApproach";
import SelectedWork from "./SelectedWork";
import TrustAndRecognition from "./TrustAndRecognition";
import Leadership from "./Leadership";
import CompanyProfile from "./CompanyProfile";
import AboutCTA from "./AboutCTA";

/** Rail chapters group the page's sections (see data-chapter-section on each). */
const ABOUT_CHAPTERS: Chapter[] = [
  { id: "01", label: "About Innosoft", live: true },
  { id: "02", label: "Our Approach", live: true },
  { id: "03", label: "Selected Work", live: true },
  { id: "04", label: "Recognition & Leadership", live: true },
  { id: "05", label: "Work With Us", live: true },
];

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = prefersReducedMotion();
    const root = rootRef.current!;

    const ctx = gsap.context(() => {
      // Hero entrance: environment first, then copy
      const heroField = root.querySelector("[data-about-hero] [data-field]");
      if (heroField) revealNetworkField(heroField, { reduced });
      gsap.fromTo(
        "[data-hero-reveal]",
        { autoAlpha: 0, y: reduced ? 0 : 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduced ? 0.4 : 1.2,
          stagger: reduced ? 0 : 0.12,
          delay: reduced ? 0 : 0.6,
          ease: "power3.out",
        },
      );
      root.classList.remove("about-intro-pending");

      // Closing bookend reveals when it scrolls in
      const cta = root.querySelector("[data-about-cta]");
      const ctaField = cta?.querySelector("[data-field]");
      if (cta && ctaField) revealNetworkField(ctaField, { reduced, trigger: cta });

      if (!reduced && !isMobileViewport() && heroField) {
        parallaxField(heroField, root.querySelector("[data-about-hero]")!);
      }

      createReveals({ reduced });
      createLineDraws({ reduced });
      createAboutChapters();
    }, root);

    // Images and fonts can shift layout after first paint
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  const scrollToSection = useCallback((selector: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(selector);
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY, 1.6);
  }, []);

  const navigate = useCallback(
    (index: number) => scrollToSection(`[data-chapter-section="${index}"]`),
    [scrollToSection],
  );

  return (
    <div ref={rootRef} className="about-intro-pending">
      <Header active="about" />
      <ChapterNavigation chapters={ABOUT_CHAPTERS} onNavigate={navigate} withProgress={false} />
      <main>
        <AboutHero onExplore={() => scrollToSection("#approach")} />
        <OurStory />
        <OurApproach />
        <SelectedWork />
        <TrustAndRecognition />
        <Leadership />
        <CompanyProfile />
        <AboutCTA />
      </main>
      <Footer />
    </div>
  );
}
