import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { approachPlacement, heroPlacement, type SceneState } from "@/scene/sceneState";
import { addApproachReveal } from "./approachAnimation";

/** Where in the track's progress the approach is fully settled (used by the chapter nav). */
export const APPROACH_SETTLED = 0.9;

/**
 * Section 01 → 02. One scrubbed timeline over the sticky stage track.
 *   DIGITAL EARTH → GLOBAL NETWORK → ORBITAL SYSTEM → DIGITAL SPHERE
 * Every value is continuous, so scrolling back reverses the exact same path.
 */
export function createTransition(state: SceneState, opts: { reduced: boolean }) {
  const travel = { p: 0 };
  const place = () => {
    const h = heroPlacement();
    const a = approachPlacement();
    const e = travel.p;
    state.x = h.x + (a.x - h.x) * e;
    state.y = h.y + (a.y - h.y) * e;
    // Log-space radius so the shrink reads as constant camera travel, not a sudden collapse
    state.radius = Math.exp(Math.log(h.radius) + (Math.log(a.radius) - Math.log(h.radius)) * e);
  };
  place();

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  // 1. Hero typography drifts away first, slower than the scene
  tl.to("[data-hero-content]", { y: -80, autoAlpha: 0, duration: 0.34, ease: "power1.in" }, 0.03)
    .to("[data-trusted-row]", { y: -30, autoAlpha: 0, duration: 0.16, ease: "power2.in" }, 0)

    // 2. Camera travel: the planet recedes and drifts toward its new orbit position
    .to(travel, { p: 1, duration: 0.72, ease: "power1.inOut", onUpdate: place }, 0.02)
    .to(state, { cameraPush: opts.reduced ? 0 : 1, duration: 0.5, ease: "power1.inOut" }, 0)
    .to(state, { cameraPush: opts.reduced ? 0 : 0.35, duration: 0.3, ease: "power1.inOut" }, 0.55)
    .to(state, { tilt: 1, duration: 0.6, ease: "power1.inOut" }, 0.08)

    // 3. The physical surface dims; the network becomes the dominant read
    .to(state, { network: 1, duration: 0.22, ease: "power1.out" }, 0.1)
    .to(state, { cityLights: 0, duration: 0.38, ease: "power1.in" }, 0.18)
    .to(state, { surface: 0.4, duration: 0.35 }, 0.16)

    // 4. Arcs lift off the globe and bend into orbital paths
    .to(state, { morph: 1, duration: 0.44, ease: "none" }, 0.3)

    // 5. The earth's shader resolves into the digital sphere; the atmosphere stays the thread
    .to(state, { digital: 1, duration: 0.38, ease: "power1.inOut" }, 0.44)
    .to(state, { network: 0.7, duration: 0.2 }, 0.78);

  // 6. Section 02 arrives
  addApproachReveal(tl, state, 0.46);

  // Hold so the settled state has room to breathe before the stage releases
  tl.to({}, { duration: 0.12 }, 0.88);

  const track = "[data-stage-track]";

  if (opts.reduced) {
    // No scrub: a short crossfade between the same two scene states
    let target = 0;
    return ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        const next = self.progress > 0.3 ? 1 : 0;
        if (next === target) return;
        target = next;
        tl.tweenTo(next ? tl.duration() : 0, { duration: 1, ease: "power1.inOut" });
      },
      onRefresh: place,
    });
  }

  return ScrollTrigger.create({
    trigger: track,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.9,
    animation: tl,
    invalidateOnRefresh: true,
    onRefresh: place,
  });
}

/** When the stage releases, the scene rides up with the page. */
export function createStageExit(state: SceneState) {
  return gsap.to(state, {
    exitY: 2,
    ease: "none",
    scrollTrigger: {
      trigger: "[data-after-stage]",
      start: "top bottom",
      end: "top top",
      scrub: true,
    },
  });
}
