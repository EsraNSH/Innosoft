/**
 * Technologies Innosoft works with. Shown as "Technology Ecosystem",
 * not as official partnerships.
 *
 * LOGOS: the files in /public/logos are placeholders. Replace each file with the
 * official logo (SVG preferred; keep the filename) or point `logo.src` at a new
 * path and update width/height to the file's intrinsic size.
 */
export type Technology = {
  name: string;
  group: string;
  logo: { src: string; width: number; height: number };
};

export const TECHNOLOGY_GROUPS = ["Cloud platforms", "Networks & infrastructure", "Security"] as const;

export const TECHNOLOGIES: Technology[] = [
  { name: "AWS", group: "Cloud platforms", logo: { src: "/logos/aws.svg", width: 200, height: 60 } },
  { name: "Red Hat", group: "Cloud platforms", logo: { src: "/logos/red-hat.svg", width: 200, height: 60 } },
  { name: "Cisco", group: "Networks & infrastructure", logo: { src: "/logos/cisco.svg", width: 200, height: 60 } },
  {
    name: "Hewlett Packard Enterprise",
    group: "Networks & infrastructure",
    logo: { src: "/logos/hewlett-packard-enterprise.svg", width: 200, height: 60 },
  },
  { name: "DigiCert", group: "Security", logo: { src: "/logos/digicert.svg", width: 200, height: 60 } },
  { name: "Trend Micro", group: "Security", logo: { src: "/logos/trend-micro.svg", width: 200, height: 60 } },
];
