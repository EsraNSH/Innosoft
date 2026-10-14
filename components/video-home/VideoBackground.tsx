"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./VideoBackground.module.css";

const SRC = "/media/innosoft-background.mp4";
/** Frame shown when the video can't or shouldn't play (the Innosoft sphere). */
const STILL_AT = 3.2;

/**
 * One fixed, looping, muted background video for the whole page.
 * Never tied to scroll: it keeps playing while sections scroll over it.
 * Reduced motion or blocked autoplay → paused on a still frame of the same video.
 */
export default function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React doesn't reliably reflect `muted` as an attribute; autoplay policies require it
    video.muted = true;
    const showStill = () => {
      video.pause();
      if (video.readyState >= 1) video.currentTime = STILL_AT;
      else video.addEventListener("loadedmetadata", () => (video.currentTime = STILL_AT), { once: true });
    };
    const reveal = () => video.setAttribute("data-ready", "");
    // Button state follows the element itself (no promise races)
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadeddata", reveal, { once: true });
    if (video.readyState >= 2) reveal();

    const cleanup = () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
    if (prefersReducedMotion()) {
      showStill();
      return cleanup;
    }
    // Autoplay blocked (e.g. iOS Low Power Mode) → still frame; the button can still start it
    video.play().catch(showStill);
    return cleanup;
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <>
      <div className={styles.layer} aria-hidden="true">
        <video
          ref={ref}
          className={styles.video}
          src={SRC}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        />
        <div className={styles.overlay} />
      </div>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={playing ? "Pause background video" : "Play background video"}
        aria-pressed={!playing}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1" width="3" height="10" rx="0.5" />
            <rect x="7" y="1" width="3" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M2.5 1v10l8-5z" />
          </svg>
        )}
      </button>
    </>
  );
}
