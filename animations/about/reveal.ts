import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One motion system for the About page: anything marked [data-reveal]
 * fades up once as it enters. Elements entering together are staggered.
 * Hidden start states are applied here (JS only) so content is visible without JS.
 * Must run inside a gsap.context.
 */
export function createReveals(opts: { reduced: boolean }) {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (!items.length) return;
  gsap.set(items, { autoAlpha: 0, y: opts.reduced ? 0 : 24 });
  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: opts.reduced ? 0.3 : 0.9,
        stagger: opts.reduced ? 0 : 0.08,
        ease: "power3.out",
        overwrite: true,
      }),
  });
}
