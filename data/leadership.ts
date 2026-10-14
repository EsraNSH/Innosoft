/** Leadership. `portrait: null` shows a clearly-marked placeholder frame. */
export type Leader = {
  name: string;
  role: string;
  bio: string;
  portrait: { src: string; alt: string } | null;
  profileUrl: string | null;
};

export const LEADERS: Leader[] = [
  {
    name: "Loai Labani",
    role: "Founder & CEO",
    bio: "Loai Labani founded Innosoft in 2011 at King Fahd University of Petroleum and Minerals and leads the company as its CEO.",
    portrait: null,
    profileUrl: null,
  },
];
