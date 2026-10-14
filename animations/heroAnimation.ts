import { gsap } from "gsap";
import type { SceneState } from "@/scene/sceneState";

/**
 * Initial-load choreography. Scene first (space → planet → atmosphere → network),
 * typography after, so the environment is established before anything asks to be read.
 * Must run inside a gsap.context scoped to the page root.
 */
export function playHeroIntro(state: SceneState, opts: { reduced: boolean }) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (opts.reduced) {
    tl.to(state, { introStars: 1, introEarth: 1, introAtmosphere: 1, introNodes: 1, duration: 0.8 }, 0).fromTo(
      "[data-intro]",
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.8 },
      0.1,
    );
    return tl;
  }

  tl.to(state, { introStars: 1, duration: 2.4, ease: "power1.out" }, 0)
    .to(state, { introEarth: 1, duration: 3.4, ease: "power3.out" }, 0.35)
    .to(state, { introAtmosphere: 1, duration: 3, ease: "power2.inOut" }, 0.8)
    .to(state, { introNodes: 1, duration: 2.6, ease: "power1.inOut" }, 1.6)
    .fromTo("[data-hero-eyebrow]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.3 }, 1.7)
    .fromTo(
      "[data-hero-line]",
      { yPercent: 105 },
      { yPercent: 0, duration: 1.6, stagger: 0.16, ease: "power4.out" },
      1.85,
    )
    .set("[data-hero-headline]", { autoAlpha: 1 }, 1.85)
    .fromTo("[data-hero-desc]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1.4 }, 2.55)
    .fromTo(
      "[data-hero-cta]",
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.14 },
      2.85,
    )
    .fromTo(
      "[data-trusted]",
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 1.6, stagger: 0.12, ease: "power2.out" },
      3.2,
    );

  return tl;
}
