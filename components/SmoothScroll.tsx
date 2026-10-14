"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSmoothScroll, jumpTo } from "@/lib/smoothScroll";
import { prefersReducedMotion } from "@/lib/motion";

/** The one Lenis instance for the whole site, synced to GSAP's ticker and ScrollTrigger. */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return initSmoothScroll(prefersReducedMotion());
  }, []);

  // Client-side navigation: start the new page at the top, in sync with Lenis
  const pathname = usePathname();
  useEffect(() => {
    jumpTo(0);
  }, [pathname]);

  return null;
}
