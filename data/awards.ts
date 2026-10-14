/** Awards and recognition, as published on the current Innosoft About page. */
export type Award = {
  year: string;
  name: string;
  issuer?: string;
  description?: string;
  /** Optional official logo/icon path; a neutral icon is used when absent. */
  logo?: string;
  icon: "medal" | "trophy" | "star" | "ribbon" | "flag" | "target";
};

export const AWARDS: Award[] = [
  { year: "2022", name: "Excellence Award", issuer: "King Abdulaziz Quality Award", icon: "medal" },
  {
    year: "2017",
    name: "Iktva Excellence Award",
    issuer: "Saudi Aramco",
    description: "Best SME vendors in Saudi Aramco.",
    icon: "trophy",
  },
  {
    year: "2014–2015",
    name: "Top 100 Enterprises",
    issuer: "Forbes",
    description: "Enterprises shaping the future of Saudi Arabia.",
    icon: "target",
  },
  {
    year: "2014",
    name: "Dr. Ghazi Al Gosaibi Award",
    description: "Most promising SME in the Eastern Province.",
    icon: "ribbon",
  },
  {
    year: "2013",
    name: "Wa'ed entrepreneur network",
    issuer: "Aramco Entrepreneurship Center (Wa'ed)",
    description: "Eighth member of the network.",
    icon: "star",
  },
  {
    year: "2012",
    name: "Saudi National Business Plan Competition",
    description: "First place for the best IT business plan.",
    icon: "flag",
  },
];
