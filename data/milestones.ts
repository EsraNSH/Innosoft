/**
 * Company timeline. Only verified milestones belong here — add entries as
 * they are confirmed; the timeline renders any number of them.
 */
export type Milestone = { date: string; title: string; description?: string; image?: string };

export const MILESTONES: Milestone[] = [
  {
    date: "2011",
    title: "Established",
    description: "Loai Labani founded Innosoft in 2011 at King Fahd University of Petroleum and Minerals.",
  },
];
