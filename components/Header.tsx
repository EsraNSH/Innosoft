import Link from "next/link";
import Logo from "./Logo";
import SiteLink from "./SiteLink";
import { NAV, ROUTES, type NavKey } from "@/lib/site";
import styles from "./Header.module.css";

type Props = {
  active?: NavKey;
  /** Optional page-specific links shown before Contact Us (e.g. the homepage's video versions). */
  extraLinks?: { href: string; label: string; icon: "play" | "scroll" }[];
};

export default function Header({ active, extraLinks = [] }: Props) {
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
        {extraLinks.map((l) => (
          <Link key={l.href} href={l.href} className={styles.extra} title={l.label}>
            <span className={styles.extraIcon} aria-hidden="true">
              {l.icon === "play" ? (
                <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor">
                  <path d="M0 0v9l8-4.5z" />
                </svg>
              ) : (
                <svg width="10" height="13" viewBox="0 0 10 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="0.65" y="0.65" width="8.7" height="11.7" rx="4.35" />
                  <path d="M5 3v2.6" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className={styles.extraLabel}>{l.label}</span>
          </Link>
        ))}
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
