import { gsap } from "gsap";
import type { SceneState } from "@/scene/sceneState";

/**
 * Section 02 reveal, appended to the transition timeline at `at`
 * (timeline units are fractions of the scroll track).
 * Order: orbits draw → sphere brightens → nodes → DISCOVER / DESIGN / BUILD → text → CTA.
 */
export function addApproachReveal(tl: gsap.core.Timeline, state: SceneState, at: number) {
  tl.to(state, { orbitDraw: 1, duration: 0.3, ease: "none" }, at)
    .to(state, { coreGlow: 1, duration: 0.24, ease: "power1.inOut" }, at + 0.08)
    .to(state, { coreMark: 1, duration: 0.18, ease: "power1.out" }, at + 0.14)
    .to(state, { labels: 1, duration: 0.12, ease: "power1.out" }, at + 0.2)
    .fromTo(
      "[data-label]",
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.035, ease: "power2.out" },
      at + 0.22,
    )
    // Text enters while the hero copy is still leaving, so the page never goes silent
    .fromTo(
      "[data-approach-eyebrow]",
      { autoAlpha: 0, x: -36 },
      { autoAlpha: 1, x: 0, duration: 0.12, ease: "power3.out" },
      at + 0.02,
    )
    .fromTo(
      "[data-approach-line]",
      { autoAlpha: 0, x: -48 },
      { autoAlpha: 1, x: 0, duration: 0.14, stagger: 0.035, ease: "power3.out" },
      at + 0.05,
    )
    .fromTo(
      "[data-approach-desc]",
      { autoAlpha: 0, x: -36 },
      { autoAlpha: 1, x: 0, duration: 0.12, ease: "power3.out" },
      at + 0.12,
    )
    .fromTo(
      "[data-approach-cta]",
      { autoAlpha: 0, x: -24 },
      { autoAlpha: 1, x: 0, duration: 0.1, ease: "power3.out" },
      at + 0.3,
    );
}

/** Hovering a label pulses its paired orbit node in the scene. */
export function bindLabelHover(state: SceneState, labels: HTMLElement[]) {
  const offs = labels.map((el, i) => {
    const enter = () => gsap.to(state.hover, { [i]: 1, duration: 0.5, ease: "power2.out" });
    const leave = () => gsap.to(state.hover, { [i]: 0, duration: 0.7, ease: "power2.out" });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
    };
  });
  return () => offs.forEach((off) => off());
}
