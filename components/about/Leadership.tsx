import Image from "next/image";
import SiteLink from "@/components/SiteLink";
import { LEADERS } from "@/data/leadership";
import { ArrowUpRight } from "./Icons";
import shared from "./about.module.css";
import styles from "./Leadership.module.css";

export default function Leadership() {
  return (
    <section id="leadership" className={shared.section} aria-labelledby="leadership-title" data-chapter-section="3">
      <p className={shared.eyebrow} data-reveal>
        Leadership
      </p>
      <h2 id="leadership-title" className={shared.h2} data-reveal>
        <span>Leadership With a</span>
        <span className={shared.accent}>Long-Term Vision.</span>
      </h2>
      <p className={shared.lead} data-reveal>
        Meet the leadership behind Innosoft and the people shaping its direction.
      </p>

      {LEADERS.map((l) => (
        <article key={l.name} className={styles.grid}>
          <div className={styles.portrait} data-reveal>
            {l.portrait ? (
              <Image src={l.portrait.src} alt={l.portrait.alt} fill sizes="(max-width: 767px) 90vw, 440px" />
            ) : (
              <>
                <svg className={styles.silhouette} viewBox="0 0 100 110" fill="currentColor" aria-hidden="true">
                  <circle cx="50" cy="34" r="22" />
                  <path d="M6 110c2-28 20-44 44-44s42 16 44 44z" />
                </svg>
                <span className={styles.portraitNote}>Portrait to be supplied</span>
              </>
            )}
          </div>
          <div data-reveal>
            <h3 className={styles.name}>{l.name}</h3>
            <p className={styles.role}>{l.role}</p>
            <p className={styles.bio}>{l.bio}</p>
            {l.profileUrl && (
              <div className={styles.profile}>
                <SiteLink href={l.profileUrl} className={shared.textLink} external>
                  View profile
                  <ArrowUpRight />
                </SiteLink>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
