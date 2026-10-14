import styles from "./TrustedBy.module.css";

/**
 * Placeholder client marks. Drop official SVGs into /public/logos and set `logo`
 * to replace the neutral emblem.
 */
const CLIENTS: { ar: string; en: string; logo?: string }[] = [
  { ar: "وزارة الصحة", en: "Ministry of Health" },
  { ar: "وزارة التعليم", en: "Ministry of Education" },
  { ar: "أمانة منطقة الرياض", en: "Riyadh Region Municipality" },
  { ar: "وزارة العدل", en: "Ministry of Justice" },
];

function Emblem() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="11.5" stroke="currentColor" strokeOpacity="0.55" />
      <path d="M13 5.5 19 13l-6 7.5L7 13z" stroke="currentColor" strokeOpacity="0.8" />
      <circle cx="13" cy="13" r="2" fill="currentColor" fillOpacity="0.8" />
    </svg>
  );
}

export default function TrustedBy() {
  return (
    <div className={styles.row} data-trusted-row>
      <p className={styles.label} data-trusted>
        Trusted by
      </p>
      <ul className={styles.list}>
        {CLIENTS.map((c) => (
          <li key={c.en} className={styles.item} data-trusted>
            {c.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logo} alt={c.en} />
            ) : (
              <>
                <Emblem />
                <span className={styles.text}>
                  <span className={styles.ar} lang="ar">
                    {c.ar}
                  </span>
                  <span className={styles.en}>{c.en}</span>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
