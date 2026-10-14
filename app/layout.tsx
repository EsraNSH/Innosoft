import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Innosoft — Digital Solutions That Matter",
  description:
    "We design, build and deliver secure, scalable and innovative digital solutions for government and enterprise organizations.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SmoothScroll />
        {children}
        <noscript>
          <style>{`.intro-pending [data-hero-eyebrow],.intro-pending [data-hero-headline],.intro-pending [data-hero-desc],.intro-pending [data-hero-cta],.intro-pending [data-trusted],[data-approach-eyebrow],[data-approach-line],[data-approach-desc],[data-approach-cta],[data-label],.about-intro-pending [data-hero-reveal]{visibility:visible!important;opacity:1!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
