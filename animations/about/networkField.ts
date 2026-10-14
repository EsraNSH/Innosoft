import { gsap } from "gsap";

/**
 * Entrance for a NetworkField: stars fade in, nodes appear gradually,
 * selected lines draw. `trigger` defers it until the field scrolls into view.
 */
export function revealNetworkField(field: Element, opts: { reduced: boolean; delay?: number; trigger?: Element }) {
  const stars = field.querySelector("[data-field-stars]");
  const horizon = field.querySelector("[data-field-horizon]");
  const nodes = field.querySelectorAll("[data-net-node]");
  const lines = field.querySelectorAll("[data-net-line]");

  const tl = gsap.timeline({
    delay: opts.delay ?? 0,
    scrollTrigger: opts.trigger ? { trigger: opts.trigger, start: "top 75%", once: true } : undefined,
  });

  if (opts.reduced) {
    tl.fromTo(field, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 });
    return tl;
  }

  tl.fromTo(stars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.2, ease: "power1.out" }, 0);
  if (horizon) tl.fromTo(horizon, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 2, ease: "power3.out" }, 0);
  tl.fromTo(
    nodes,
    { autoAlpha: 0, scale: 0.4 },
    { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out", stagger: { amount: 1.8, from: "random" } },
    0.4,
  ).fromTo(
    lines,
    { strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: { amount: 1.6, from: "random" } },
    0.9,
  );
  return tl;
}

/** Gentle background parallax (desktop, full motion only). */
export function parallaxField(field: Element, section: Element) {
  const svg = field.querySelector("[data-field-svg]");
  return gsap.to(svg, {
    yPercent: 6,
    ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
  });
}
