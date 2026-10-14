import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About Innosoft — Engineering Technology. Enabling Progress.",
  description:
    "Innosoft is a Saudi technology company established in 2011 at King Fahd University of Petroleum and Minerals, providing software solutions, infrastructure, and technology consulting.",
};

export default function About() {
  return <AboutPage />;
}
