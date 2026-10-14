import NetworkField from "./NetworkField";
import { ArrowRight } from "./Icons";
import shared from "./about.module.css";
import styles from "./AboutHero.module.css";

/** Verified facts only (from the provided company information). */
const FACTS = [
  { value: "2011", label: "Established" },
  { value: "KFUPM", label: "Founded at" },
  { value: "Public · Private · Nonprofit", label: "Sectors served" },
  { value: "KSA", label: "Headquartered" },
];

type Props = { onExplore: () => void };

export default function AboutHero({ onExplore }: Props) {
  return (
    <section id="about" className={styles.hero} aria-labelledby="about-title" data-chapter-section="0" data-about-hero>
      <NetworkField variant="hero" />
      <div className={styles.content}>
        <p className={styles.eyebrow} data-hero-reveal>
          <span>01</span>
          <span className={styles.rule} aria-hidden="true" />
          <span>ABOUT INNOSOFT</span>
        </p>
        <h1 id="about-title" className={styles.headline}>
          <span data-hero-reveal>Engineering Technology.</span>
          <span data-hero-reveal className={shared.accent}>
            Enabling Progress.
          </span>
        </h1>
        <p className={styles.desc} data-hero-reveal>
          Innosoft is a Saudi technology company established in 2011 at King Fahd University of Petroleum and
          Minerals. We provide software solutions, infrastructure, and technology consulting to public, private, and
          nonprofit organizations.
        </p>
        <div className={styles.cta} data-hero-reveal>
          {/* No Capabilities page yet: lead into the Approach section on this page */}
          <button type="button" className={shared.primaryBtn} onClick={onExplore}>
            Explore Our Capabilities
            <ArrowRight />
          </button>
        </div>
      </div>
      <ul className={styles.facts} aria-label="Company facts">
        {FACTS.map((f) => (
          <li key={f.label} className={styles.fact} data-hero-reveal>
            <span className={styles.factValue}>{f.value}</span>
            <span className={styles.factLabel}>{f.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
