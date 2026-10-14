import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * About rail: the active chapter is the last [data-chapter-section] whose top
 * has crossed 55% of the viewport. Computed on every scroll update, so fast
 * jumps (rail clicks, keyboard End) can't leave a stale chapter behind.
 */
export function createAboutChapters() {
  const items = gsap.utils.toArray<HTMLElement>("[data-chapter]");
  const sections = gsap.utils.toArray<HTMLElement>("[data-chapter-section]");
  let active = -1;
  const sync = () => {
    const line = window.innerHeight * 0.55;
    let index = 0;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) index = Number(s.dataset.chapterSection);
    }
    if (index === active) return;
    active = index;
    items.forEach((el, j) => el.toggleAttribute("data-active", j === index));
  };
  sync();
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync, onRefresh: sync });
}
