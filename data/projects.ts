/**
 * Selected Work carousel content — the single source for all three cards.
 *
 * ILLUSTRATIVE PLACEHOLDERS: these are not confirmed Innosoft case studies.
 * Replace titles, copy, tags, images and `href` with real project data.
 * Images render in a 16:9 frame with object-fit: cover (centre-cropped);
 * supply at least 1600×900 for best results. `href: null` shows a disabled
 * "Case study coming soon" action instead of a link.
 */
export type Project = {
  id: string;
  category: string;
  title: string;
  description: string;
  tags?: string[];
  image: { src: string; alt: string; width: number; height: number };
  href: string | null;
  isPlaceholder: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "digital-services-platform",
    category: "Government",
    title: "Digital Services Platform",
    description: "Supporting seamless access to government services through a unified digital platform.",
    tags: ["Platform", "Digital Services"],
    image: {
      src: "/projects/placeholder-01.svg",
      alt: "Placeholder illustration: abstract digital service interface",
      width: 1600,
      height: 1000,
    },
    href: null,
    isPlaceholder: true,
  },
  {
    id: "infrastructure-modernization",
    category: "Enterprise",
    title: "Infrastructure Modernization",
    description:
      "Designing and implementing a scalable, secure, and high-performing infrastructure to support growing organizational needs.",
    tags: ["Cloud", "Infrastructure", "Security"],
    image: {
      src: "/projects/placeholder-02.svg",
      alt: "Placeholder illustration: abstract infrastructure blocks",
      width: 1600,
      height: 1000,
    },
    href: null,
    isPlaceholder: true,
  },
  {
    id: "data-enablement-program",
    category: "Data & Analytics",
    title: "Data Enablement Program",
    description: "Building data capabilities to enable better decision-making and more efficient operations.",
    tags: ["Data", "Analytics"],
    image: {
      src: "/projects/placeholder-03.svg",
      alt: "Placeholder illustration: abstract data dashboard",
      width: 1600,
      height: 1000,
    },
    href: null,
    isPlaceholder: true,
  },
];
