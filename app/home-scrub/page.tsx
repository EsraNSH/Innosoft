import type { Metadata } from "next";
import VideoHome from "@/components/video-home/VideoHome";

export const metadata: Metadata = {
  title: "Innosoft — Digital Solutions That Matter (Scroll Video)",
  description:
    "We design, build and deliver secure, scalable and innovative digital solutions for government and enterprise organizations.",
};

export default function HomeScrub() {
  return <VideoHome mode="scrub" />;
}
