import TrustedBy from "./TrustedBy";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.content} data-hero-content>
        <p className={styles.eyebrow} data-hero-eyebrow data-intro>
          REIMAGINING THE FUTURE
        </p>
        <h1 id="hero-title" className={styles.headline} data-hero-headline data-intro>
          <span className={styles.line}>
            <span data-hero-line>Digital</span>
          </span>
          <span className={styles.line}>
            <span data-hero-line>Solutions</span>
          </span>
          <span className={styles.line}>
            <span data-hero-line className={styles.accent}>
              That Matter
            </span>
          </span>
        </h1>
        <p className={styles.desc} data-hero-desc data-intro>
          We design, build and deliver secure, scalable and innovative digital solutions for government and
          enterprise organizations.
        </p>
        <div className={styles.ctas}>
          <a href="#approach" className={styles.primary} data-hero-cta data-intro>
            Explore Solutions
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <path d="M0 6h12.5M8 1.2 12.8 6 8 10.8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
          <button className={styles.showreel} data-hero-cta data-intro type="button">
            <span className={styles.play}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                <path d="M0 0v12l10-6z" />
              </svg>
            </span>
            Watch Showreel
          </button>
        </div>
      </div>
      <TrustedBy />
    </section>
  );
}
