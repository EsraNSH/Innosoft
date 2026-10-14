import Link from "next/link";
import Logo from "./Logo";
import SiteLink from "./SiteLink";
import { CONTACT, NAV, ROUTES } from "@/lib/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <Link href={ROUTES.home} aria-label="Innosoft home">
            <Logo />
          </Link>
          <p className={styles.blurb}>
            A Saudi technology company providing software solutions, infrastructure, and technology consulting.
          </p>
        </div>
        <nav className={styles.nav} aria-label="Footer">
          {NAV.map((item) => (
            <SiteLink key={item.key} href={item.href}>
              {item.label}
            </SiteLink>
          ))}
          <SiteLink href={ROUTES.contact} pendingLabel="Contact page coming soon">
            Contact
          </SiteLink>
        </nav>
      </div>
      <div className={styles.bottom}>
        <span>© {year} Innosoft. All rights reserved.</span>
        <div className={styles.contact}>
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}>{CONTACT.phone}</a>}
          {CONTACT.location && <span>{CONTACT.location}</span>}
        </div>
      </div>
    </footer>
  );
}
