import SiteLink from "@/components/SiteLink";
import { COMPANY_PROFILE } from "@/lib/site";
import { ArrowUpRight, Download } from "./Icons";
import shared from "./about.module.css";
import styles from "./CompanyProfile.module.css";

/** Secondary action. URLs come from lib/site.ts; until set, actions are marked unavailable. */
export default function CompanyProfile() {
  const pending = !COMPANY_PROFILE.downloadUrl && !COMPANY_PROFILE.viewUrl;
  return (
    <section
      id="company-profile"
      className={`${shared.section} ${styles.section}`}
      aria-labelledby="profile-title"
      data-chapter-section="4"
    >
      <div className={styles.row} data-reveal>
        <div>
          <h2 id="profile-title" className={styles.title}>
            Company Profile
          </h2>
          <p className={styles.copy}>Learn more about Innosoft, its capabilities, and its technology services.</p>
        </div>
        <div className={styles.actions}>
          <SiteLink href={COMPANY_PROFILE.downloadUrl} className={styles.action} pendingLabel="Available soon">
            Download Company Profile
            <Download />
          </SiteLink>
          <SiteLink href={COMPANY_PROFILE.viewUrl} className={styles.action} pendingLabel="Available soon">
            View Company Profile
            <ArrowUpRight />
          </SiteLink>
          {pending && <p className={styles.note}>The company profile document will be available here soon.</p>}
        </div>
      </div>
    </section>
  );
}
