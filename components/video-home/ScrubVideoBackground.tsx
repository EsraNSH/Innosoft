"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./VideoBackground.module.css";

/**
 * Same footage as /media/innosoft-background.mp4, re-encoded with a keyframe on
 * every frame (and no audio) so seeking backwards is instant — the original
 * has a single keyframe, which makes reverse scrubbing stutter.
 */
const SRC = "/media/innosoft-background-scrub.mp4";
/** Reduced motion / no scrubbing: hold this frame (the Innosoft sphere). */
const STILL_AT = 3.2;
/** Fraction of the remaining distance covered per frame — smooths fast flicks. */
const FOLLOW = 0.18;
/** Don't seek for differences smaller than half a frame at 24fps. */
const MIN_STEP = 1 / 48;

type Props = {
  /** Element whose scroll range maps to the video timeline (top of page → its bottom edge leaving). */
  rangeRef: React.RefObject<HTMLElement | null>;
};

/**
 * Scroll-scrubbed background: scroll position drives video.currentTime.
 * Never autoplays or loops; holds its frame when scrolling stops.
 */
export default function ScrubVideoBackground({ rangeRef }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.pause();

    let raf = 0;
    let duration = 0;
    let shown = 0; // smoothed playhead
    let disposed = false;

    const progress = () => {
      const el = rangeRef.current;
      if (!el) return 0;
      // From page top until the range's bottom reaches the bottom of the viewport
      const end = el.offsetTop + el.offsetHeight - window.innerHeight;
      return end > 0 ? Math.min(1, Math.max(0, window.scrollY / end)) : 0;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const target = progress() * duration;
      shown += (target - shown) * FOLLOW;
      if (Math.abs(target - shown) < 0.002) shown = target;
      // Only seek when it changes meaningfully, and never stack seeks
      if (!video.seeking && Math.abs(video.currentTime - shown) >= MIN_STEP) {
        video.currentTime = shown;
      }
    };

    const reveal = () => video.setAttribute("data-ready", "");

    const start = () => {
      if (disposed) return;
      duration = Math.max(0, video.duration - 0.05); // stay off the very last frame
      reveal();
      if (prefersReducedMotion() || !Number.isFinite(duration) || duration === 0) {
        video.currentTime = STILL_AT;
        return;
      }
      shown = progress() * duration;
      video.currentTime = shown;
      raf = requestAnimationFrame(loop);
    };

    // Some mobile browsers only render seeks after the element has been "activated"
    const prime = () =>
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});

    if (video.readyState >= 1) {
      prime().then(start);
    } else {
      video.addEventListener("loadedmetadata", () => prime().then(start), { once: true });
    }
    // Loop/autoplay can never take over
    const stopPlayback = () => video.pause();
    video.addEventListener("play", stopPlayback);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("play", stopPlayback);
    };
  }, [rangeRef]);

  return (
    <div className={styles.layer} aria-hidden="true">
      <video
        ref={ref}
        className={styles.video}
        src={SRC}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />
      <div className={styles.overlay} />
    </div>
  );
}
