import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

/**
 * Chapter rail: flips the active chapter via a DOM attribute (no React state)
 * and fills the 01→02 connector with the transition progress.
 */
export function createChapterNavigation(threshold: number) {
  const items = gsap.utils.toArray<HTMLElement>("[data-chapter]");
  const fill = document.querySelector<HTMLElement>("[data-chapter-fill]");
  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    items.forEach((el, j) => el.toggleAttribute("data-active", j === i));
  };
  setActive(0);

  return ScrollTrigger.create({
    trigger: "[data-stage-track]",
    start: "top top",
    end: "bottom bottom",
    onUpdate(self) {
      setActive(self.progress >= threshold * 0.62 ? 1 : 0);
      if (fill) fill.style.transform = `scaleY(${Math.min(1, self.progress / (threshold * 0.62))})`;
    },
  });
}
