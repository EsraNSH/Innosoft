import styles from "./ApproachSection.module.css";

export default function ApproachSection() {
  return (
    <section id="approach" className={styles.approach} aria-labelledby="approach-title">
      <div className={styles.content}>
        <p className={styles.eyebrow} data-approach-eyebrow>
          OUR APPROACH
        </p>
        <h2 id="approach-title" className={styles.headline}>
          <span data-approach-line>Engineering</span>
          <span data-approach-line className={styles.accent}>
            What&rsquo;s Next
          </span>
        </h2>
        <p className={styles.desc} data-approach-desc>
          We combine deep domain knowledge with modern technologies to build digital solutions that scale and
          inspire.
        </p>
        <a href="#" className={styles.cta} data-approach-cta>
          Discover More
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
            <path d="M0 6h12.5M8 1.2 12.8 6 8 10.8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
      </div>
    </section>
  );
}
