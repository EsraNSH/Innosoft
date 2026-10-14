import Link from "next/link";
import Logo from "./Logo";
import SiteLink from "./SiteLink";
import { NAV, ROUTES, type NavKey } from "@/lib/site";
import styles from "./Header.module.css";

type Props = { active?: NavKey };

export default function Header({ active }: Props) {
  return (
    <header className={styles.header}>
      <Link href={ROUTES.home} aria-label="Innosoft home">
        <Logo />
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {NAV.map((item) => (
          <SiteLink
            key={item.key}
            href={item.href}
            className={item.key === active ? styles.active : undefined}
            aria-current={item.key === active ? "page" : undefined}
          >
            {item.label}
          </SiteLink>
        ))}
      </nav>
      <div className={styles.actions}>
        <SiteLink href={ROUTES.contact} className={styles.contact} pendingLabel="Contact page coming soon">
          Contact Us
        </SiteLink>
        <button className={styles.menu} aria-label="Open menu" type="button">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M0 1h14M0 5h14M0 9h14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
