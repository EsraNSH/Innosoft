import type { Award } from "@/data/awards";
import styles from "./Trust.module.css";

/** Neutral line icons — official award marks can replace them via `logo`. */
const ICONS: Record<Award["icon"], React.ReactNode> = {
  medal: <path d="M9 3h6l-1.5 5h-3zM12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-8.5 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" />,
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1.5A3 3 0 0 0 8 10.4M16 6h3v1.5a3 3 0 0 1-3 2.9M12 13v4M8.5 20h7M9.5 17h5v3h-5z" />,
  target: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />,
  ribbon: <path d="M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.8 12.8 7 21l5-2.5 5 2.5-1.8-8.2" />,
  star: <path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
};

export default function AwardsList({ awards }: { awards: Award[] }) {
  return (
    <ul className={styles.awards}>
      {awards.map((a) => (
        <li key={a.year + a.name} className={styles.award} data-reveal>
          <div className={styles.awardTop}>
            <span className={styles.year}>{a.year}</span>
            <span className={styles.awardIcon} aria-hidden="true">
              {a.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.logo} alt="" />
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
                  {ICONS[a.icon]}
                </svg>
              )}
            </span>
          </div>
          <div className={styles.awardBody}>
            <h4 className={styles.awardName}>{a.name}</h4>
            {a.issuer && <p className={styles.issuer}>{a.issuer}</p>}
            {a.description && <p className={styles.awardDesc}>{a.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
