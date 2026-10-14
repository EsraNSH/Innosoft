import { gsap } from "gsap";

/**
 * SVG line drawing for diagrams: inside each [data-draw] container, lines
 * marked [data-draw-line] (pathLength=1, dasharray 1) draw in and
 * [data-draw-node] items activate one after another, once, on entry.
 */
export function createLineDraws(opts: { reduced: boolean }) {
  gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((container) => {
    const lines = container.querySelectorAll("[data-draw-line]");
    const nodes = container.querySelectorAll("[data-draw-node]");
    if (opts.reduced) return; // Drawn state is the default — nothing to do
    gsap.set(lines, { strokeDashoffset: 1 });
    gsap.set(nodes, { autoAlpha: 0, scale: 0.85 });
    gsap
      .timeline({ scrollTrigger: { trigger: container, start: "top 78%", once: true } })
      .to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.18, ease: "power2.inOut" }, 0)
      .to(nodes, { autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.22, ease: "power3.out" }, 0.25);
  });
}
