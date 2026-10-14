import { AWARDS } from "@/data/awards";
import AwardsList from "./AwardsList";
import TechnologyEcosystem from "./TechnologyEcosystem";
import shared from "./about.module.css";
import styles from "./Trust.module.css";

export default function TrustAndRecognition() {
  const since = Math.min(...AWARDS.map((a) => parseInt(a.year, 10)));
  return (
    <section id="recognition" className={shared.section} aria-labelledby="trust-title" data-chapter-section="3">
      <p className={shared.eyebrow} data-reveal>
        Awards &amp; Recognition
      </p>
      <h2 id="trust-title" className={shared.h2} data-reveal>
        <span>A Track Record</span>
        <span className={shared.accent}>Built Over Time.</span>
      </h2>
      <p className={shared.lead} data-reveal>
        A look at the recognition, technology ecosystem, and experience behind our work.
      </p>

      {AWARDS.length > 0 && (
        <>
          <div className={styles.subhead} data-reveal>
            <h3 className={styles.subTitle}>Recognition</h3>
            <p className={styles.subNote}>Since {since}</p>
          </div>
          <AwardsList awards={AWARDS} />
        </>
      )}

      <div className={styles.subhead} data-reveal>
        <h3 className={styles.subTitle}>Technology Ecosystem</h3>
        <p className={styles.subNote}>Technologies we work with across cloud, networks and security.</p>
      </div>
      <TechnologyEcosystem />
    </section>
  );
}
