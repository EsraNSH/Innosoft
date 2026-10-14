import SiteLink from "@/components/SiteLink";
import { ROUTES } from "@/lib/site";
import NetworkField from "./NetworkField";
import { ArrowRight } from "./Icons";
import shared from "./about.module.css";
import styles from "./AboutCTA.module.css";

/** Closing bookend: returns to the hero's network language, settling on a blue horizon. */
export default function AboutCTA() {
  return (
    <section
      id="contact-cta"
      className={`${shared.section} ${styles.cta}`}
      aria-labelledby="cta-title"
      data-chapter-section="4"
      data-about-cta
    >
      <NetworkField variant="horizon" />
      <div className={styles.content}>
        <p className={shared.eyebrow} data-reveal>
          Let&rsquo;s Work Together
        </p>
        <h2 id="cta-title" className={styles.headline} data-reveal>
          Let&rsquo;s Build <span className={shared.accent}>What Comes Next.</span>
        </h2>
        <p className={styles.lead} data-reveal>
          Have a challenge in mind? Let&rsquo;s explore how technology can help.
        </p>
        <div className={styles.action} data-reveal>
          <SiteLink href={ROUTES.contact} className={shared.primaryBtn} pendingLabel="Contact page coming soon">
            Start a Conversation
            <ArrowRight />
          </SiteLink>
          {!ROUTES.contact && <span className={shared.pendingNote}>Contact page coming soon</span>}
        </div>
      </div>
    </section>
  );
}
